"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GALLERY_MAX, GALLERY_START } from "@/leadgen/components/demo/templates/shared";

// Mirrors the canonical slot policy in shared.tsx. Bumping GALLERY_MAX there
// propagates here automatically.
const GALLERY_LAST = GALLERY_START + GALLERY_MAX - 1; // index, inclusive

/**
 * Curate the lead's `photos` array. `photos[0]` is the hero in every demo
 * template; `slice(1, 7)` is the gallery. Operator can:
 *   - promote any photo to hero (move it to index 0)
 *   - remove unwanted shots (text overlays, screenshots, etc.)
 * Saves the new array via POST /api/leads/[id]/update — same server-side
 * dedupe + 20 cap as the IG enrich path.
 */
export function PhotoManager({ id, photos }: { id: string; photos: string[] }) {
  const router = useRouter();
  const [list, setList] = useState<string[]>(photos);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  async function persist(next: string[]) {
    setErr(null);
    setList(next);
    const res = await fetch(`/api/leads/${id}/update`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ photos: next }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setErr(j.error ?? "Errore salvataggio");
      setList(photos); // revert optimistic state
      return;
    }
    startTransition(() => router.refresh());
  }

  function setHero(i: number) {
    if (i === 0 || pending) return;
    const next = [list[i]!, ...list.filter((_, j) => j !== i)];
    void persist(next);
  }
  function remove(i: number) {
    if (pending) return;
    const next = list.filter((_, j) => j !== i);
    void persist(next);
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (pending || j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j]!, next[i]!];
    void persist(next);
  }

  if (list.length === 0) {
    return <p className="text-sm text-zinc-500">Nessuna foto. Usa il pulsante &ldquo;Foto IG&rdquo; per arricchire.</p>;
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-3 text-xs text-zinc-500">
        <span>
          <b className="text-zinc-300">{list.length}</b> foto · <b className="text-amber-400">#1 = hero</b> · #{GALLERY_START + 1}-{GALLERY_LAST + 1} = galleria
        </span>
        {pending && <span className="text-zinc-400">Salvo…</span>}
        {err && <span className="text-red-400">{err}</span>}
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {list.map((src, i) => {
          const isHero = i === 0;
          const isGallery = i >= GALLERY_START && i <= GALLERY_LAST;
          return (
            <li
              key={src}
              className={`group relative overflow-hidden rounded-lg border bg-zinc-900 ${
                isHero ? "border-amber-400 ring-1 ring-amber-400/40" : "border-zinc-800"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Foto ${i + 1}`} loading="lazy" className="aspect-square w-full object-cover" />
              <div className="absolute left-1 top-1 flex items-center gap-1">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                    isHero ? "bg-amber-400 text-zinc-900" : isGallery ? "bg-zinc-700/90 text-zinc-100" : "bg-zinc-900/80 text-zinc-400"
                  }`}
                >
                  #{i + 1}
                </span>
                {isHero && <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-900">HERO</span>}
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/85 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    type="button"
                    title="Sposta su"
                    disabled={pending || i === 0}
                    onClick={() => move(i, -1)}
                    className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-xs text-zinc-100 hover:bg-zinc-700 disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    title="Sposta giù"
                    disabled={pending || i === list.length - 1}
                    onClick={() => move(i, 1)}
                    className="rounded bg-zinc-800/90 px-1.5 py-0.5 text-xs text-zinc-100 hover:bg-zinc-700 disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
                <div className="flex gap-1">
                  {!isHero && (
                    <button
                      type="button"
                      title="Imposta come hero"
                      disabled={pending}
                      onClick={() => setHero(i)}
                      className="rounded bg-amber-500/90 px-2 py-0.5 text-xs font-semibold text-zinc-900 hover:bg-amber-400 disabled:opacity-50"
                    >
                      ★ Hero
                    </button>
                  )}
                  <button
                    type="button"
                    title="Rimuovi foto"
                    disabled={pending}
                    onClick={() => remove(i)}
                    className="rounded bg-red-500/90 px-1.5 py-0.5 text-xs font-semibold text-white hover:bg-red-400 disabled:opacity-50"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
