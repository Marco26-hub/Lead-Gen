/* ============================================================
   Better Auth server instance.
   Email + password only, public sign-up DISABLED (agency team only;
   seed the first admin with `npm run db:seed`). The admin plugin adds
   roles (role-ready for a future client portal).
   Server-only: never import from a Client Component — use
   `@/lib/auth-client` in the browser instead.
   ============================================================ */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "@/lib/db";
import { user, session, account, verification } from "@/lib/db/schema";

// A real secret MUST be set in production (signs session cookies). The
// placeholder only keeps `next build` working before env vars are wired up,
// mirroring how the contact route degrades gracefully without RESEND_*.
const secret =
  process.env.BETTER_AUTH_SECRET ??
  "INSECURE_PLACEHOLDER_SET_BETTER_AUTH_SECRET_IN_ENV";

export const auth = betterAuth({
  appName: "Aether Admin",
  secret,
  // Optional: pin the canonical URL (otherwise inferred from the request).
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once per day
  },
  plugins: [admin()],
});
