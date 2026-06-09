"use server";

/* ============================================================
   Server Actions della dashboard lead-gen (/app).
   Ogni azione ricontrolla la sessione admin prima di scrivere.
   ============================================================ */
import { revalidatePath } from "next/cache";
import { getServiceClient } from "@maps/core";
import { requireAdmin } from "@/lib/admin/auth";
import { ensureClientForLead } from "@/leadgen/lib/clients";

/** Conversione manuale lead → cliente (admin). La logica è in ensureClientForLead. */
export async function convertLeadToClient(leadId: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const r = await ensureClientForLead(leadId);
  if (r.error) return { ok: false, error: r.error };
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
