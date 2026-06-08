/* ============================================================
   Admin auth guards (server-only). Used by the protected route
   group + server actions. Redirects to the login page when there
   is no admin session.
   ============================================================ */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Returns the current session (or null). Does not redirect. */
export async function getAdminSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Require an authenticated admin. Redirects to /admin/login when there is
 * no session, or when the signed-in user is not an admin. Returns the
 * session so callers get the user without a second lookup.
 */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.user.role !== "admin") redirect("/admin/login?error=forbidden");
  return session;
}
