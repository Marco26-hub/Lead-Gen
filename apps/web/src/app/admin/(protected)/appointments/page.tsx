import { getAppointments, getClientOptions } from "@/lib/admin/queries";
import { appointmentStatus } from "@/lib/db/schema";
import {
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} from "@/app/admin/actions";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Field, adminInputClass } from "@/components/admin/Field";
import {
  Table,
  Thead,
  Th,
  Tr,
  Td,
  TableEmpty,
} from "@/components/admin/Table";
import { fmtDateTime } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const [rows, clientOptions] = await Promise.all([
    getAppointments(),
    getClientOptions(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
        <p className="mt-1 text-sm text-muted">
          Calls, meetings and bookings.
        </p>
      </div>

      <details className="panel rounded-2xl p-5">
        <summary className="cursor-pointer text-sm font-medium text-ink">
          + Add appointment
        </summary>
        <form
          action={createAppointment}
          className="mt-5 grid gap-4 sm:grid-cols-2"
        >
          <Field label="Title">
            <input name="title" required className={adminInputClass} />
          </Field>
          <Field label="Client">
            <select
              name="clientId"
              defaultValue=""
              className={adminInputClass}
            >
              <option value="">— None —</option>
              {clientOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Starts at">
            <input
              name="startsAt"
              type="datetime-local"
              required
              className={adminInputClass}
            />
          </Field>
          <Field label="Location">
            <input
              name="location"
              placeholder="Call, address, link…"
              className={adminInputClass}
            />
          </Field>
          <Field label="Status">
            <select
              name="status"
              defaultValue="scheduled"
              className={cn(adminInputClass, "capitalize")}
            >
              {appointmentStatus.enumValues.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <textarea
                name="notes"
                className={cn(adminInputClass, "min-h-20 resize-y")}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="h-10 rounded-full bg-ink px-5 text-sm font-medium text-ink-inverse transition-colors hover:bg-white"
            >
              Save appointment
            </button>
          </div>
        </form>
      </details>

      <Table>
        <Thead>
          <Tr>
            <Th>Title</Th>
            <Th>Client</Th>
            <Th>When</Th>
            <Th>Location</Th>
            <Th>Status</Th>
            <Th />
          </Tr>
        </Thead>
        <tbody>
          {rows.length === 0 ? (
            <TableEmpty colSpan={6}>No appointments yet.</TableEmpty>
          ) : (
            rows.map((a) => (
              <Tr key={a.id}>
                <Td className="whitespace-nowrap font-medium text-ink">
                  {a.title}
                </Td>
                <Td className="text-muted">{a.clientName ?? "—"}</Td>
                <Td className="whitespace-nowrap text-muted">
                  {fmtDateTime(a.startsAt)}
                </Td>
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
                    confirmText="Delete this appointment?"
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
