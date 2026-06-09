"use server";

/* ============================================================
   Server Actions della dashboard lead-gen (/app).
   Ogni azione ricontrolla la sessione admin prima di scrivere.
   ============================================================ */
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getServiceClient } from "@maps/core";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/auth";

/** Converte un lead in cliente (agency.clients) e lo collega via leads.client_id. Idempotente. */
export async function convertLeadToClient(leadId: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const sb = getServiceClient();
  const { data: lead, error } = await sb.from("leads").select("*").eq("id", leadId).maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!lead) return { ok: false, error: "Lead non trovato" };
  if (lead.client_id) return { ok: true }; // già convertito

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
  revalidatePath(`/app/leads/${leadId}`);
  revalidatePath("/app/clients");
  return { ok: true };
}

/** Cambia lo stato di un lead (usata da Kanban drag&drop). */
export async function updateLeadStatusAction(leadId: string, status: string): Promise<void> {
  await requireAdmin();
  const { error } = await getServiceClient().from("leads").update({ status }).eq("id", leadId);
  if (error) throw new Error(error.message);
  revalidatePath("/app/board");
  revalidatePath("/app/leads");
}

/** Cambio stato in blocco. */
export async function bulkUpdateStatus(ids: string[], status: string): Promise<void> {
  await requireAdmin();
  if (!ids.length) return;
  const { error } = await getServiceClient().from("leads").update({ status }).in("id", ids);
  if (error) throw new Error(error.message);
  revalidatePath("/app/leads");
  revalidatePath("/app/board");
}

/** Eliminazione in blocco. */
export async function bulkDeleteLeads(ids: string[]): Promise<void> {
  await requireAdmin();
  if (!ids.length) return;
  const { error } = await getServiceClient().from("leads").delete().in("id", ids);
  if (error) throw new Error(error.message);
  revalidatePath("/app/leads");
  revalidatePath("/app/board");
}
