"use server";

/* ============================================================
   Admin mutations (Server Actions). Every action re-checks the
   admin session before touching the database.
   ============================================================ */
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  appointments,
  clients,
  type AppointmentStatus,
  type ClientStatus,
} from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/auth";

/* ---------------- Clients ---------------- */
export async function createClient(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await db.insert(clients).values({
    name,
    email: String(formData.get("email") ?? "").trim() || null,
    company: String(formData.get("company") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    status: (String(formData.get("status") ?? "active") as ClientStatus),
    notes: String(formData.get("notes") ?? "").trim() || null,
  });
  revalidatePath("/app/clients");
  revalidatePath("/app");
}

export async function updateClientStatus(id: string, status: ClientStatus) {
  await requireAdmin();
  await db
    .update(clients)
    .set({ status, updatedAt: new Date() })
    .where(eq(clients.id, id));
  revalidatePath("/app/clients");
}

export async function deleteClient(id: string) {
  await requireAdmin();
  await db.delete(clients).where(eq(clients.id, id));
  revalidatePath("/app/clients");
}

/* ---------------- Appointments ---------------- */
export async function createAppointment(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const startsAtRaw = String(formData.get("startsAt") ?? "").trim();
  if (!title || !startsAtRaw) return;
  const startsAt = new Date(startsAtRaw);
  if (Number.isNaN(startsAt.getTime())) return;
  const clientId = String(formData.get("clientId") ?? "").trim() || null;
  await db.insert(appointments).values({
    title,
    clientId,
    startsAt,
    location: String(formData.get("location") ?? "").trim() || null,
    status: (String(formData.get("status") ?? "scheduled") as AppointmentStatus),
    notes: String(formData.get("notes") ?? "").trim() || null,
  });
  revalidatePath("/app/appointments");
  revalidatePath("/app");
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
) {
  await requireAdmin();
  await db
    .update(appointments)
    .set({ status, updatedAt: new Date() })
    .where(eq(appointments.id, id));
  revalidatePath("/app/appointments");
}

export async function deleteAppointment(id: string) {
  await requireAdmin();
  await db.delete(appointments).where(eq(appointments.id, id));
  revalidatePath("/app/appointments");
  revalidatePath("/app");
}
