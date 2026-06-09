import { getAppointments, getClientOptions } from "@/lib/admin/queries";
import { appointmentStatus } from "@/lib/db/schema";
import { createAppointment, updateAppointmentStatus, deleteAppointment } from "@/app/admin/actions";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Field, adminInputClass } from "@/components/admin/Field";
import { Table, Thead, Th, Tr, Td, TableEmpty } from "@/components/admin/Table";
import { fmtDateTime } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const [rows, clientOptions] = await Promise.all([getAppointments(), getClientOptions()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Appuntamenti</h1>
        <p className="mt-1 text-sm text-zinc-400">Call, riunioni e prenotazioni.</p>
      </div>

      <details className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <summary className="cursor-pointer text-sm font-medium text-zinc-200">
          + Aggiungi appuntamento
        </summary>
        <form action={createAppointment} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Titolo">
            <input name="title" required className={adminInputClass} />
          </Field>
          <Field label="Cliente">
            <select name="clientId" defaultValue="" className={adminInputClass}>
              <option value="">— Nessuno —</option>
              {clientOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Inizio">
            <input name="startsAt" type="datetime-local" required className={adminInputClass} />
          </Field>
          <Field label="Luogo">
            <input name="location" placeholder="Call, indirizzo, link…" className={adminInputClass} />
          </Field>
          <Field label="Stato">
            <select name="status" defaultValue="scheduled" className={cn(adminInputClass, "capitalize")}>
              {appointmentStatus.enumValues.map((s) => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Note">
              <textarea name="notes" className={cn(adminInputClass, "min-h-20 resize-y")} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="h-10 rounded-lg bg-indigo-500 px-5 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
            >
              Salva appuntamento
            </button>
          </div>
        </form>
      </details>

      <Table>
        <Thead>
          <Tr>
            <Th>Titolo</Th>
            <Th>Cliente</Th>
            <Th>Quando</Th>
            <Th>Luogo</Th>
            <Th>Stato</Th>
            <Th />
          </Tr>
        </Thead>
        <tbody>
          {rows.length === 0 ? (
            <TableEmpty colSpan={6}>Nessun appuntamento ancora.</TableEmpty>
          ) : (
            rows.map((a) => (
              <Tr key={a.id}>
                <Td className="whitespace-nowrap font-medium text-ink">{a.title}</Td>
                <Td className="text-muted">{a.clientName ?? "—"}</Td>
                <Td className="whitespace-nowrap text-muted">{fmtDateTime(a.startsAt)}</Td>
                <Td className="text-muted">{a.location ?? "—"}</Td>
                <Td>
                  <StatusSelect
                    value={a.status}
                    options={appointmentStatus.enumValues}
                    action={updateAppointmentStatus.bind(null, a.id)}
                  />
                </Td>
                <Td>
                  <DeleteButton
                    action={deleteAppointment.bind(null, a.id)}
                    confirmText="Eliminare questo appuntamento?"
                  />
                </Td>
              </Tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
