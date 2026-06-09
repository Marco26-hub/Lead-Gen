"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateLeadStatusAction } from "@/app/app/actions";

export interface BoardLead {
  id: string;
  business_name: string;
  city: string | null;
  priority: string | null;
  status: string;
}

const COLUMNS: { key: string; label: string }[] = [
  { key: "scraped", label: "Scraped" },
  { key: "classified", label: "Classificato" },
  { key: "generated", label: "Demo pronta" },
  { key: "approved", label: "Approvato" },
  { key: "contacted", label: "Contattato" },
  { key: "trialing", label: "Trial" },
  { key: "paying", label: "Pagante" },
];

const PRIO_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

export function KanbanBoard({ initial }: { initial: BoardLead[] }) {
  const [leads, setLeads] = useState(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [, start] = useTransition();

  function move(id: string, status: string) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    start(() => {
      void updateLeadStatusAction(id, status);
    });
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const items = leads.filter((l) => l.status === col.key);
        return (
          <div
            key={col.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragId) move(dragId, col.key);
              setDragId(null);
            }}
            className="flex w-64 shrink-0 flex-col rounded-xl border border-zinc-800 bg-zinc-900/30 p-2"
          >
            <div className="flex items-center justify-between px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              {col.label}
              <span className="rounded bg-zinc-800 px-1.5 text-zinc-300">{items.length}</span>
            </div>
            <div className="flex min-h-12 flex-col gap-2">
              {items.map((l) => (
                <div
                  key={l.id}
                  draggable
                  onDragStart={() => setDragId(l.id)}
                  className="cursor-grab rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 transition-colors hover:border-zinc-700 active:cursor-grabbing"
                >
                  <Link
                    href={`/app/leads/${l.id}`}
                    className="block truncate text-sm font-medium text-zinc-100 hover:text-indigo-300"
                  >
                    {l.business_name}
                  </Link>
                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                    {l.priority && (
                      <span className={`h-2 w-2 rounded-full ${PRIO_DOT[l.priority] ?? "bg-zinc-600"}`} />
                    )}
                    {l.city ?? "—"}
                  </div>
                </div>
              ))}
              {items.length === 0 && <div className="px-2 py-3 text-xs text-zinc-600">vuoto</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
