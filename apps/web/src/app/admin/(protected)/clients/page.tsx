import { getClients } from "@/lib/admin/queries";
import { clientStatus } from "@/lib/db/schema";
import {
  createClient,
  updateClientStatus,
  deleteClient,
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
import { fmtDate } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const rows = await getClients();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
        <p className="mt-1 text-sm text-muted">
          Your roster of accounts and prospects.
        </p>
      </div>

      <details className="panel rounded-2xl p-5">
        <summary className="cursor-pointer text-sm font-medium text-ink">
          + Add client
        </summary>
        <form action={createClient} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input name="name" required className={adminInputClass} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" className={adminInputClass} />
          </Field>
          <Field label="Company">
            <input name="company" className={adminInputClass} />
          </Field>
          <Field label="Phone">
            <input name="phone" className={adminInputClass} />
          </Field>
          <Field label="Status">
            <select
              name="status"
              defaultValue="active"
              className={cn(adminInputClass, "capitalize")}
            >
              {clientStatus.enumValues.map((s) => (
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
              Save client
            </button>
          </div>
        </form>
      </details>

      <Table>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Company</Th>
            <Th>Phone</Th>
            <Th>Status</Th>
            <Th>Added</Th>
            <Th />
          </Tr>
        </Thead>
        <tbody>
          {rows.length === 0 ? (
            <TableEmpty colSpan={7}>No clients yet.</TableEmpty>
          ) : (
            rows.map((c) => (
              <Tr key={c.id}>
                <Td className="whitespace-nowrap font-medium text-ink">
                  {c.name}
                </Td>
                <Td className="text-muted">{c.email ?? "—"}</Td>
                <Td className="text-muted">{c.company ?? "—"}</Td>
                <Td className="whitespace-nowrap text-muted">
                  {c.phone ?? "—"}
                </Td>
                <Td>
                  <StatusSelect
                    value={c.status}
                    options={clientStatus.enumValues}
                    action={updateClientStatus.bind(null, c.id)}
                  />
                </Td>
                <Td className="whitespace-nowrap text-faint">
                  {fmtDate(c.createdAt)}
                </Td>
                <Td>
                  <DeleteButton
                    action={deleteClient.bind(null, c.id)}
                    confirmText="Delete this client?"
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
