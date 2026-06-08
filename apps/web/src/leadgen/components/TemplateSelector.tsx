"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ThemePreset } from "@maps/core/schemas";
import { defaultTemplateFor } from "@maps/core/templates";
import { TEMPLATE_LABELS, templatesForPreset } from "@/leadgen/components/demo/templates/catalog";

/**
 * Per-lead demo template picker. Switching is layout-only (no LLM): it POSTs the
 * new template, the API revalidates the public demo, and we refresh the iframe.
 */
export function TemplateSelector({
  id,
  current,
  preset,
  category,
}: {
  id: string;
  current: string | null;
  preset: ThemePreset;
  category?: string | null;
}) {
  const router = useRouter();
  const options = templatesForPreset(preset);
  // Preselect the system's hybrid choice (e.g. pizzeria) when the lead has no
  // explicit template yet — works before generation too.
  const [value, setValue] = useState(current ?? defaultTemplateFor(category, preset));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (options.length <= 1) return null; // single template for this category → nothing to pick

  async function change(next: string) {
    const prev = value;
    setValue(next);
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch(`/api/leads/${id}/update`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ template: next }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) router.refresh();
      else {
        setErr(j.error ?? "Errore");
        setValue(prev);
      }
    } catch (e) {
      setErr((e as Error).message);
      setValue(prev);
    } finally {
      setSaving(false);
    }
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-zinc-400">Template</span>
      <select
        value={value}
        disabled={saving}
        onChange={(e) => change(e.target.value)}
        className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-zinc-100 disabled:opacity-50"
      >
        {options.map((k) => (
          <option key={k} value={k}>
            {TEMPLATE_LABELS[k] ?? k}
          </option>
        ))}
      </select>
      {err && <span className="text-red-400">{err}</span>}
    </label>
  );
}
