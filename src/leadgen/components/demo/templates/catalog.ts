import type { ThemePreset } from "@maps/core/schemas";

/**
 * Pure data about templates — safe to import from client components and API routes
 * (no React component / CSS imports). The component map lives in `registry.ts`.
 * Import from core SUBMODULES (not the barrel) so client bundles don't pull in
 * node-only deps (config/supabase → node:fs).
 */

// Default template per preset is shared with the orchestrator → lives in core.
export { defaultTemplateForPreset } from "@maps/core/templates";

export const TEMPLATE_LABELS: Record<string, string> = {
  editorial: "Editorial",
  "ristorante-classic": "Ristorante — Classico",
  pizzeria: "Ristorante — Pizzeria",
  "pesce-mare": "Ristorante — Pesce/Mare",
  "carne-montagna": "Ristorante — Carne/Montagna",
  "etnico-fusion": "Ristorante — Etnico/Fusion",
  "idraulica-pronto": "Idraulico — Pronto intervento",
  "barber-shop": "Parrucchiere — Barber Shop",
  barber: "Parrucchiere — Barber Shop",
  uomo: "Parrucchiere — Uomo",
  donna: "Parrucchiere — Donna",
  unisex: "Parrucchiere — Unisex",
  modern: "Parrucchiere — Moderno",
};

export const TEMPLATE_KEYS = Object.keys(TEMPLATE_LABELS);

export function isTemplateKey(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(TEMPLATE_LABELS, name);
}

/** Template keys offered for a preset (default first) — drives the dashboard selector. */
export function templatesForPreset(preset: ThemePreset): string[] {
  if (preset === "restaurant") return ["ristorante-classic", "pizzeria", "pesce-mare", "carne-montagna", "etnico-fusion", "editorial"];
  if (preset === "artisan") return ["idraulica-pronto", "editorial"];
  if (preset === "beauty") return ["unisex", "barber-shop", "uomo", "donna", "modern", "editorial"];
  return ["editorial"];
}
