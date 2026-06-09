"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { LeadRow } from "@maps/core";
import { PriorityBadge, SiteBadge, SourceBadge, StatusPill } from "@/leadgen/components/badges";
import { bulkUpdateStatus, bulkDeleteLeads } from "@/app/app/actions";

const BULK_STATUSES = [
  "classified",
  "generated",
  "approved",
  "contacted",
  "replied",
  "trialing",
  "paying",
  "suppressed",
];

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

function exportCsv(rows: LeadRow[]) {
  const header = ["business_name", "category", "city", "address", "email", "phone_e164", "rating", "status", "source"];
  const lines = [header.join(",")];
  for (const l of rows) {
    lines.push(
      [l.business_name, l.category, l.city, l.address, l.email, l.phone_e164, l.rating, l.status, l.source]
        .map(csvCell)
        .join(","),
    );
  }
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lead-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function LeadsTable({
  leads,
  columns,
  sortHrefs,
  activeSort,
  activeDir,
}: {
  leads: LeadRow[];
  columns: { key: string; label: string }[];
  sortHrefs: Record<string, string>;
  activeSort?: string;
  activeDir?: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState("");
  const [pending, start] = useTransition();

  const allSelected = leads.length > 0 && selected.size === leads.length;
  const selectedRows = useMemo(() => leads.filter((l) => selected.has(l.id)), [leads, selected]);

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(leads.map((l) => l.id)));
  }

  const ids = [...selected];

  return (
    <div className="mt-6 space-y-3">
      {/* Bulk bar */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-zinc-400">
          {selected.size > 0 ? `${selected.size} selezionati` : `${leads.length} lead`}
        </span>
        <button
          onClick={() => exportCsv(selected.size > 0 ? selectedRows : leads)}
          className="h-9 rounded-lg border border-zinc-700 bg-zinc-800 px-3 font-medium text-zinc-100 hover:bg-zinc-700"
        >
          ⤓ Esporta CSV{selected.size > 0 ? ` (${selected.size})` : ""}
        </button>
        {selected.size > 0 && (
          <>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-9 rounded-lg border border-zinc-700 bg-zinc-900 px-2 text-zinc-100"
            >
              <option value="">cambia stato…</option>
              {BULK_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              disabled={!status || pending}
              onClick={() =>
                start(async () => {
                  await bulkUpdateStatus(ids, status);
                  setSelected(new Set());
                  setStatus("");
                  router.refresh();
                })
              }
              className="h-9 rounded-lg bg-indigo-500 px-3 font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
            >
              Applica
            </button>
            <button
              disabled={pending}
              onClick={() => {
                if (!confirm(`Eliminare ${ids.length} lead?`)) return;
                start(async () => {
                  await bulkDeleteLeads(ids);
                  setSelected(new Set());
                  router.refresh();
                });
              }}
              className="h-9 rounded-lg border border-red-500/40 bg-red-500/10 px-3 font-medium text-red-200 hover:bg-red-500/20 disabled:opacity-50"
            >
              Elimina
            </button>
            <button onClick={() => setSelected(new Set())} className="px-2 text-zinc-400 hover:text-zinc-200">
              deseleziona
            </button>
          </>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900/70 text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Seleziona tutti" />
              </th>
              {columns.map((c) => {
                const active = activeSort === c.key;
                return (
                  <th key={c.key} className="px-4 py-3 font-semibold">
                    <Link
                      href={sortHrefs[c.key]}
                      className={`inline-flex items-center gap-1 transition-colors hover:text-zinc-100 ${active ? "text-indigo-300" : ""}`}
                    >
                      {c.label}
                      <span className="text-[10px] opacity-80">{active ? (activeDir === "desc" ? "▼" : "▲") : "↕"}</span>
                    </Link>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {leads.map((l) => (
              <tr key={l.id} className={`hover:bg-zinc-900/40 ${selected.has(l.id) ? "bg-indigo-500/5" : ""}`}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(l.id)}
                    onChange={() => toggle(l.id)}
                    aria-label={`Seleziona ${l.business_name}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/app/leads/${l.id}`} className="font-medium text-zinc-100 hover:text-indigo-300">
                    {l.business_name}
                  </Link>
                  <div className="text-xs text-zinc-500">{l.city ?? l.address ?? "—"}</div>
                </td>
                <td className="px-4 py-3"><SourceBadge source={l.source} /></td>
                <td className="px-4 py-3 text-zinc-300">{l.category ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-300">
                  {l.rating != null ? `${l.rating}★` : "—"}
                  <span className="text-zinc-500"> ({l.review_count ?? 0})</span>
                </td>
                <td className="px-4 py-3">
                  {l.phone_type === "mobile" ? (
                    <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300 ring-1 ring-emerald-500/30">📱 sì</span>
                  ) : l.phone_e164 ? (
                    <span className="text-xs text-zinc-500">fisso</span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3"><SiteBadge s={l.site_age_class} /></td>
                <td className="px-4 py-3"><PriorityBadge p={l.priority} /></td>
                <td className="px-4 py-3"><StatusPill status={l.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
