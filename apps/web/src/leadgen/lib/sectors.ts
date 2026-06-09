/**
 * Mappa categoria (Google Maps, testo libero/incoerente) → SETTORE curato.
 * Usata per le card-per-settore della dashboard e per il filtro `sector`.
 */
export type SectorKey =
  | "ristorazione"
  | "beauty"
  | "salute"
  | "casa"
  | "retail"
  | "altro";

export interface SectorMeta {
  key: SectorKey;
  label: string;
  icon: string;
  /** colore accento Tailwind (zinc dashboard): usato per ring/testo */
  accent: string;
}

export const SECTORS: SectorMeta[] = [
  { key: "ristorazione", label: "Ristorazione", icon: "🍽️", accent: "amber" },
  { key: "beauty", label: "Beauty & Parrucchieri", icon: "✂️", accent: "pink" },
  { key: "salute", label: "Salute & Benessere", icon: "🩺", accent: "emerald" },
  { key: "casa", label: "Casa & Artigiani", icon: "🔧", accent: "sky" },
  { key: "retail", label: "Retail & Negozi", icon: "🛍️", accent: "violet" },
  { key: "altro", label: "Altro", icon: "📁", accent: "zinc" },
];

// Ordine importante: la prima regola che matcha vince.
const RULES: Array<{ key: SectorKey; re: RegExp }> = [
  {
    key: "beauty",
    re: /parrucchier|salone|bellezz|estetic|barbier|barberia|nail|unghie|\bspa\b|tattoo|tatuagg|prodotti di bellezza/i,
  },
  {
    key: "salute",
    re: /fisioterap|osteopat|\bmedic|dentist|odonto|poliambulator|farmac|psicolog|nutrizion|veterinar|ottic|podolog|ambulator|studio medico/i,
  },
  {
    key: "ristorazione",
    re: /ristorant|pizzer|paninotec|trattori|osteri|steak|braceri|sushi|gelater|pasticcer|enotec|rosticc|tavola calda|caff[eè]|gelateria|\bbar\b|pub\b|birrer/i,
  },
  {
    key: "casa",
    re: /idraulic|elettricist|imbianchin|fabbro|artigian|edil|muratore|falegnam|serrament|infiss|giardinier|puliz|trasloc|condizionator|caldai|ristruttur|termoidraul/i,
  },
  {
    key: "retail",
    re: /negozio|abbigliament|calzatur|gioieller|profumer|ferrament|libreri|fioraio|cartoler|\bretail\b|\bstore\b|boutique|supermercat|alimentari/i,
  },
];

/** Settore di un lead dalla sua category. null = lead senza categoria (es. form sito). */
export function sectorOf(category: string | null | undefined): SectorKey | null {
  if (!category || !category.trim()) return null;
  for (const r of RULES) if (r.re.test(category)) return r.key;
  return "altro";
}

export function sectorMeta(key: SectorKey): SectorMeta {
  return SECTORS.find((s) => s.key === key) ?? SECTORS[SECTORS.length - 1];
}
