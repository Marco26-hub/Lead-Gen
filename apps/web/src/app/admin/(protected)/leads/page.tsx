import { redirect } from "next/navigation";

/**
 * Website leads are no longer a separate list. All leads (Google Maps scraping
 * + website contact form) live in the shared public.leads table and are
 * managed in the unified lead-gen dashboard. Keep this route as a redirect so
 * old links / bookmarks land in the right place.
 */
export default function LeadsRedirect() {
  redirect("/app/leads");
}
