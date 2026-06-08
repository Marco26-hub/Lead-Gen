/**
 * Seed the first admin user for the dashboard.
 *
 *   1. Fill DATABASE_URL + SEED_ADMIN_* in .env.local
 *   2. Apply the schema:  npm run db:migrate   (or db:push)
 *   3. Seed:              npm run db:seed
 *
 * Re-running is safe: an existing user is left in place (role ensured = admin).
 * Creates a Better Auth user + a "credential" account holding the hashed
 * password, exactly as a normal email+password sign-up would.
 */
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

// Minimal .env loader so `tsx scripts/seed-admin.ts` works with no extra flags.
// Runs BEFORE the dynamic imports below, which read process.env at load time.
for (const file of [".env.local", ".env"]) {
  try {
    const txt = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const [, key, rawValue] = m;
      if (process.env[key] !== undefined) continue;
      let value = rawValue.trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  } catch {
    /* file missing — ignore */
  }
}

async function main() {
  const { db } = await import("../src/lib/db");
  const { user, account } = await import("../src/lib/db/schema");
  const { hashPassword } = await import("better-auth/crypto");
  const { eq } = await import("drizzle-orm");

  const email = process.env.SEED_ADMIN_EMAIL?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Admin";

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set (add it to .env.local).");
  }
  if (!email || !password) {
    throw new Error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD first.");
  }

  const existing = await db.select().from(user).where(eq(user.email, email));
  if (existing.length > 0) {
    await db
      .update(user)
      .set({ role: "admin", updatedAt: new Date() })
      .where(eq(user.email, email));
    console.log(`✓ User ${email} already exists — ensured role=admin.`);
    return;
  }

  const userId = randomUUID();
  const now = new Date();
  const hashed = await hashPassword(password);

  await db.insert(user).values({
    id: userId,
    name,
    email,
    emailVerified: true,
    role: "admin",
    createdAt: now,
    updatedAt: now,
  });
  await db.insert(account).values({
    id: randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: hashed,
    createdAt: now,
    updatedAt: now,
  });

  console.log(`✓ Created admin ${email}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Seed failed:", err);
    process.exit(1);
  });
