/* ============================================================
   Read queries for the admin dashboard (server-only).
   ============================================================ */
import { asc, count, desc, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { appointments, clients } from "@/lib/db/schema";

export async function getClients() {
  return db.select().from(clients).orderBy(desc(clients.createdAt));
}

export async function getAppointments() {
  return db
    .select({
      id: appointments.id,
      title: appointments.title,
      clientId: appointments.clientId,
      clientName: clients.name,
      startsAt: appointments.startsAt,
      endsAt: appointments.endsAt,
      location: appointments.location,
      status: appointments.status,
      notes: appointments.notes,
      createdAt: appointments.createdAt,
    })
    .from(appointments)
    .leftJoin(clients, eq(appointments.clientId, clients.id))
    .orderBy(asc(appointments.startsAt));
}

/** Lightweight client list for the appointment form's dropdown. */
export async function getClientOptions() {
  return db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .orderBy(asc(clients.name));
}

export async function getDashboardStats() {
  const now = new Date();
  // Leads are no longer stored here — they live in the shared public.leads
  // table and are managed in the /app lead-gen dashboard. The site admin
  // overview only covers clients + appointments.
  const [[activeClients], [upcoming]] = await Promise.all([
    db
      .select({ v: count() })
      .from(clients)
      .where(eq(clients.status, "active")),
    db
      .select({ v: count() })
      .from(appointments)
      .where(gte(appointments.startsAt, now)),
  ]);

  return {
    activeClients: activeClients?.v ?? 0,
    upcomingAppointments: upcoming?.v ?? 0,
  };
}
