"use client";

/* ============================================================
   Better Auth browser client. Talks to /api/auth/* on the same
   origin (baseURL inferred). Used by the login + sign-out UI.
   ============================================================ */
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [adminClient()],
});

export const { signIn, signOut, useSession } = authClient;
