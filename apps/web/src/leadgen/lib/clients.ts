import "server-only";
import { randomUUID } from "node:crypto";
import { getServiceClient } from "@maps/core";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";

/**
 * Crea il cliente (agency.clients) a partire da un lead e lo collega via
 * public.leads.client_id. Idempotente: se il lead ha già client_id non fa nulla.
 * NESSUN auth-check qui: usato sia dall'azione admin (convertLeadToClient) sia
 * dal webhook Stripe (auto-conversione su 'paying').
 */
export async function ensureClientForLead(
  leadId: string,
): Promise<{ created: boolean; clientId?: string; error?: string }> {
  const sb = getServiceClient();
  const { data: lead, error } = await sb.from("leads").select("*").eq("id", leadId).maybeSingle();
  if (error) return { created: false, error: error.message };
  if (!lead) return { created: false, error: "Lead non trovato" };
  if (lead.client_id) return { created: false, clientId: lead.client_id as string };

  const id = randomUUID();
  await db.insert(clients).values({
    id,
    name: (lead.business_name as string) || "Cliente",
    email: (lead.email as string) ?? null,
    company: (lead.business_name as string) ?? null,
    phone: (lead.phone_e164 as string) ?? null,
    status: "active",
    notes: [
      "Da lead lead-gen",
      lead.category ? `settore: ${lead.category}` : null,
      lead.city ? `città: ${lead.city}` : null,
    ]
      .filter(Boolean)
      .join(" · "),
  });
  await sb.from("leads").update({ client_id: id }).eq("id", leadId);
  return { created: true, clientId: id };
}
