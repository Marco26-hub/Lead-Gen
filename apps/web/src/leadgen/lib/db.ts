import { getServiceClient, type BookingRow, type LeadRow, type ScrapeJob, type SubscriptionRow } from "@maps/core";
import { sectorOf } from "./sectors";
import { getDashboardStats } from "@/lib/admin/queries";

/** Server-only data access for the dashboard (service-role client). */

export interface LeadFilters {
  priority?: string;
  status?: string;
  source?: string;
  /** Settore curato (derivato da category lato app). */
  sector?: string;
  /** Città normalizzata; usa "__none__" per i lead senza città. */
  city?: string;
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
  if (filters.city === "__none__") query = query.is("city", null);
  else if (filters.city) query = query.eq("city", filters.city);
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
  let rows = (data ?? []) as LeadRow[];
  // `sector` non è una colonna: derivato da category → filtro lato app.
  if (filters.sector) rows = rows.filter((l) => sectorOf(l.category) === filters.sector);
  return rows;
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

/** Riga leggera per l'aggregazione hub (card settore/città). Solo lead `maps`. */
export interface HubLead {
  id: string;
  business_name: string;
  category: string | null;
  city: string | null;
  status: string;
  priority: string | null;
  source: string;
}

export async function leadsForHub(): Promise<HubLead[]> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("leads")
    .select("id,business_name,category,city,status,priority,source")
    .eq("source", "maps")
    .limit(5000);
  if (error) throw new Error(error.message);
  return (data ?? []) as HubLead[];
}

export interface HubStats {
  leadsTotal: number;
  daLavorare: number;
  inTrattativa: number;
  website: number;
  activeClients: number;
  upcomingAppointments: number;
}

const TODO_STATUSES = ["scraped", "enriched", "classified", "generated", "deployed"];
const DEAL_STATUSES = ["approved", "queued_outreach", "contacted", "replied", "trialing", "paying"];

/** KPI per la panoramica: lead per gruppi di stato + clienti/appuntamenti (schema agency). */
export async function getHubStats(): Promise<HubStats> {
  const sb = getServiceClient();
  const { data } = await sb.from("leads").select("status,source");
  let leadsTotal = 0, daLavorare = 0, inTrattativa = 0, website = 0;
  for (const r of (data ?? []) as { status: string; source: string }[]) {
    if (r.source === "website") { website++; continue; }
    leadsTotal++;
    if (TODO_STATUSES.includes(r.status)) daLavorare++;
    else if (DEAL_STATUSES.includes(r.status)) inTrattativa++;
  }
  let activeClients = 0, upcomingAppointments = 0;
  try {
    const s = await getDashboardStats();
    activeClients = s.activeClients;
    upcomingAppointments = s.upcomingAppointments;
  } catch {
    /* agency DB non raggiungibile in build: KPI clienti a 0 */
  }
  return { leadsTotal, daLavorare, inTrattativa, website, activeClients, upcomingAppointments };
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
