import Link from "next/link";
import { getClients } from "@/lib/admin/queries";
import { clientStatus } from "@/lib/db/schema";
import { createClient, updateClientStatus, deleteClient } from "@/app/admin/actions";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Field, adminInputClass } from "@/components/admin/Field";
import { Table, Thead, Th, Tr, Td, TableEmpty } from "@/components/admin/Table";
import { fmtDate } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const rows = await getClients();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clienti</h1>
        <p className="mt-1 text-sm text-zinc-400">Account attivi e prospect.</p>
      </div>

      <details className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <summary className="cursor-pointer text-sm font-medium text-zinc-200">
          + Aggiungi cliente
        </summary>
        <form action={createClient} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Nome">
            <input name="name" required className={adminInputClass} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" className={adminInputClass} />
          </Field>
          <Field label="Azienda">
            <input name="company" className={adminInputClass} />
          </Field>
          <Field label="Telefono">
            <input name="phone" className={adminInputClass} />
          </Field>
          <Field label="Stato">
            <select name="status" defaultValue="active" className={cn(adminInputClass, "capitalize")}>
              {clientStatus.enumValues.map((s) => (
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
              Salva cliente
            </button>
          </div>
        </form>
      </details>

      <Table>
        <Thead>
          <Tr>
            <Th>Nome</Th>
            <Th>Email</Th>
            <Th>Azienda</Th>
            <Th>Telefono</Th>
            <Th>Stato</Th>
            <Th>Aggiunto</Th>
            <Th />
          </Tr>
        </Thead>
        <tbody>
          {rows.length === 0 ? (
            <TableEmpty colSpan={7}>Nessun cliente ancora.</TableEmpty>
          ) : (
            rows.map((c) => (
              <Tr key={c.id} className="transition-colors hover:bg-white/5">
                <Td className="whitespace-nowrap font-medium text-ink">
                  <Link href={`/app/clients/${c.id}`} className="block hover:underline">{c.name}</Link>
                </Td>
                <Td className="text-muted">
                  <Link href={`/app/clients/${c.id}`} className="block">{c.email ?? "—"}</Link>
                </Td>
                <Td className="text-muted">
                  <Link href={`/app/clients/${c.id}`} className="block">{c.company ?? "—"}</Link>
                </Td>
                <Td className="whitespace-nowrap text-muted">
                  <Link href={`/app/clients/${c.id}`} className="block">{c.phone ?? "—"}</Link>
                </Td>
                <Td>
                  <StatusSelect
                    value={c.status}
                    options={clientStatus.enumValues}
                    action={updateClientStatus.bind(null, c.id)}
                  />
                </Td>
                <Td className="whitespace-nowrap text-faint">
                  <Link href={`/app/clients/${c.id}`} className="block">{fmtDate(c.createdAt)}</Link>
                </Td>
                <Td>
                  <DeleteButton
                    action={deleteClient.bind(null, c.id)}
                    confirmText="Eliminare questo cliente?"
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
