import { getServiceClient, type BookingRow, type LeadRow, type ScrapeJob, type SubscriptionRow } from "@maps/core";

/** Server-only data access for the dashboard (service-role client). */

export interface LeadFilters {
  priority?: string;
  status?: string;
  source?: string;
  q?: string;
  sort?: string;
  dir?: string;
}

/** Sortable column keys → DB columns (drives the clickable table headers). */
export const SORT_COLUMNS: Record<string, string> = {
  attivita: "business_name",
  provenienza: "source",
  categoria: "category",
  rating: "rating",
  whatsapp: "phone_type",
  sito: "site_age_class",
  priorita: "priority",
  stato: "status",
};

export async function listLeads(filters: LeadFilters = {}, limit = 500): Promise<LeadRow[]> {
  const sb = getServiceClient();
  let query = sb.from("leads").select("*");
  if (filters.priority) query = query.eq("priority", filters.priority);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.source) query = query.eq("source", filters.source);
  if (filters.q) {
    // Free-text search over name + category + location. Sanitize chars that would
    // break PostgREST's or() filter grammar.
    const term = filters.q.replace(/[,()*%]/g, " ").trim();
    if (term) {
      query = query.or(
        `business_name.ilike.%${term}%,category.ilike.%${term}%,address.ilike.%${term}%`,
      );
    }
  }
  const col = filters.sort ? SORT_COLUMNS[filters.sort] : undefined;
  if (col) {
    query = query.order(col, { ascending: filters.dir !== "desc", nullsFirst: false });
  } else {
    query = query
      .order("priority", { ascending: true })
      .order("rating", { ascending: false, nullsFirst: false });
  }
  const { data, error } = await query.limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as LeadRow[];
}

export async function getLead(id: string): Promise<LeadRow | null> {
  const sb = getServiceClient();
  const { data, error } = await sb.from("leads").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as LeadRow) ?? null;
}

export interface LeadCounts {
  total: number;
  high: number;
  medium: number;
  low: number;
}

export async function leadCounts(): Promise<LeadCounts> {
  const sb = getServiceClient();
  const { data, error } = await sb.from("leads").select("priority");
  if (error) throw new Error(error.message);
  const counts: LeadCounts = { total: 0, high: 0, medium: 0, low: 0 };
  for (const r of (data ?? []) as { priority: string | null }[]) {
    counts.total++;
    if (r.priority === "high") counts.high++;
    else if (r.priority === "medium") counts.medium++;
    else if (r.priority === "low") counts.low++;
  }
  return counts;
}

export async function listScrapeJobs(limit = 20): Promise<ScrapeJob[]> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("scrape_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as ScrapeJob[];
}

export async function pendingScrapedCount(): Promise<number> {
  const sb = getServiceClient();
  const { count } = await sb.from("leads").select("*", { count: "exact", head: true }).eq("status", "scraped");
  return count ?? 0;
}

/** Abbonamenti per un lead — trial e attivi. */
export async function listSubscriptions(leadId: string): Promise<SubscriptionRow[]> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("subscriptions")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as SubscriptionRow[];
}

/** Prenotazioni ricevute dal BookingForm di un lead, ordinate recenti-prima. */
export async function listBookings(leadId: string, limit = 50): Promise<BookingRow[]> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("bookings")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as BookingRow[];
}
