import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, getClientAppointments } from "@/lib/admin/queries";
import { updateClient, deleteClient } from "@/app/admin/actions";
import { clientStatus } from "@/lib/db/schema";
import { Field, adminInputClass } from "@/components/admin/Field";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Table, Thead, Th, Tr, Td, TableEmpty } from "@/components/admin/Table";
import { fmtDate, fmtDateTime } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();
  const appts = await getClientAppointments(id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/app/clients" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Clienti
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{client.name}</h1>
          <p className="mt-1 text-sm capitalize text-zinc-400">
            {client.status}
            {client.company ? ` · ${client.company}` : ""}
          </p>
        </div>
        <DeleteButton
          action={deleteClient.bind(null, client.id)}
          label="Elimina cliente"
          confirmText="Eliminare questo cliente?"
        />
      </div>

      <div className="panel rounded-2xl p-5">
        <form action={updateClient.bind(null, client.id)} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome">
            <input name="name" defaultValue={client.name} required className={adminInputClass} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" defaultValue={client.email ?? ""} className={adminInputClass} />
          </Field>
          <Field label="Azienda">
            <input name="company" defaultValue={client.company ?? ""} className={adminInputClass} />
          </Field>
          <Field label="Telefono">
            <input name="phone" defaultValue={client.phone ?? ""} className={adminInputClass} />
          </Field>
          <Field label="Stato">
            <select name="status" defaultValue={client.status} className={cn(adminInputClass, "capitalize")}>
              {clientStatus.enumValues.map((s) => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Note">
              <textarea name="notes" defaultValue={client.notes ?? ""} className={cn(adminInputClass, "min-h-24 resize-y")} />
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <button
              type="submit"
              className="h-10 rounded-lg bg-indigo-500 px-5 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
            >
              Salva modifiche
            </button>
            <span className="text-xs text-faint">
              Aggiunto {fmtDate(client.createdAt)} · aggiornato {fmtDate(client.updatedAt)}
            </span>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Appuntamenti ({appts.length})
        </h2>
        <Table>
          <Thead>
            <Tr>
              <Th>Titolo</Th>
              <Th>Quando</Th>
              <Th>Luogo</Th>
              <Th>Stato</Th>
            </Tr>
          </Thead>
          <tbody>
            {appts.length === 0 ? (
              <TableEmpty colSpan={4}>Nessun appuntamento.</TableEmpty>
            ) : (
              appts.map((a) => (
                <Tr key={a.id}>
                  <Td className="font-medium text-ink">{a.title}</Td>
                  <Td className="whitespace-nowrap text-muted">{fmtDateTime(a.startsAt)}</Td>
                  <Td className="text-muted">{a.location ?? "—"}</Td>
                  <Td className="capitalize text-muted">{a.status}</Td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
