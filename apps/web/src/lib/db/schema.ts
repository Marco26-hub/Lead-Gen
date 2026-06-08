/* ============================================================
   Database schema (Drizzle ORM · Postgres / Supabase)
   Lives in a dedicated `agency` Postgres SCHEMA so it never collides
   with the lead-gen tables in `public` (Maps). Two groups:
     1. Auth tables required by Better Auth (user/session/account/
        verification) — shape dictated by Better Auth + the admin plugin.
     2. Business tables for the site admin (clients/appointments).
   NOTE: website contact-form leads are NOT stored here — they go into the
   shared `public.leads` table (see src/app/api/contact/route.ts) so all
   leads (scraping + sito) live in one place, surfaced in the /app dashboard.
   Keep Better Auth field (property) names exactly as below — the Drizzle
   adapter maps them by property key, not by SQL column name.
   ============================================================ */
import {
  pgSchema,
  text,
  boolean,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/** All site tables live under the `agency` schema. */
export const agency = pgSchema("agency");

/* ---------------------------------------------------------------
   Better Auth — core tables
   --------------------------------------------------------------- */
export const user = agency.table("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  // admin plugin fields
  role: text("role").default("user"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = agency.table("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  // admin plugin field (impersonation)
  impersonatedBy: text("impersonated_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = agency.table("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  // hashed password for the email+password ("credential") provider
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = agency.table("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/* ---------------------------------------------------------------
   Business — enums
   --------------------------------------------------------------- */
export const clientStatus = agency.enum("client_status", [
  "prospect",
  "active",
  "paused",
  "churned",
]);

export const appointmentStatus = agency.enum("appointment_status", [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
]);

/* ---------------------------------------------------------------
   Business — tables
   --------------------------------------------------------------- */
export const clients = agency.table("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email"),
  company: text("company"),
  phone: text("phone"),
  status: clientStatus("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const appointments = agency.table("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  // Reserved for future client-portal scoping; nulled (not deleted) if a
  // client is removed so the appointment history survives.
  clientId: uuid("client_id").references(() => clients.id, {
    onDelete: "set null",
  }),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at"),
  location: text("location"),
  status: appointmentStatus("status").notNull().default("scheduled"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/* ---------------------------------------------------------------
   Inferred row types
   --------------------------------------------------------------- */
export type Client = typeof clients.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;

export type ClientStatus = (typeof clientStatus.enumValues)[number];
export type AppointmentStatus = (typeof appointmentStatus.enumValues)[number];
