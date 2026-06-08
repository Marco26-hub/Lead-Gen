/* ============================================================
   Drizzle client (node-postgres pool → Neon Postgres).
   Server-only: never import this from a Client Component.
   A single pool is reused across hot-reloads and serverless
   invocations. No connection is opened until the first query,
   so importing this at build time (without DATABASE_URL) is safe.
   ============================================================ */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

const globalForDb = globalThis as unknown as { __aetherPool?: Pool };

const pool =
  globalForDb.__aetherPool ??
  new Pool({
    connectionString,
    max: 5,
    // Neon requires TLS. The pooled connection string should end with
    // `?sslmode=require`; pg honours that. (Kept out of code so the same
    // module works for a local, non-SSL Postgres during development.)
  });

if (process.env.NODE_ENV !== "production") globalForDb.__aetherPool = pool;

export const db = drizzle(pool, { schema });

export { schema };
