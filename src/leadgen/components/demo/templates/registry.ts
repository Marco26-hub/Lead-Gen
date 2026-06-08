import type { FC } from "react";
import type { ThemePreset } from "@maps/core";
import { Editorial } from "./Editorial";
import { RistoranteClassic } from "./RistoranteClassic";
import { Pizzeria } from "./Pizzeria";
import { PesceMare } from "./PesceMare";
import { CarneMontagna } from "./CarneMontagna";
import { EtnicoFusion } from "./EtnicoFusion";
import { IdraulicaPronto } from "./IdraulicaPronto";
import { BarberShop } from "./BarberShop";
import { UomoSalone } from "./UomoSalone";
import { DonnaSalone } from "./DonnaSalone";
import { UnisexSalone } from "./UnisexSalone";
import { ModernSalone } from "./ModernSalone";
import { defaultTemplateForPreset } from "./catalog";
import type { DemoProps } from "./types";

/** Layout templates keyed by template id. Each consumes the same `DemoProps`. */
export const DEMO_TEMPLATES: Record<string, FC<DemoProps>> = {
  editorial: Editorial,
  "ristorante-classic": RistoranteClassic,
  pizzeria: Pizzeria,
  "pesce-mare": PesceMare,
  "carne-montagna": CarneMontagna,
  "etnico-fusion": EtnicoFusion,
  "idraulica-pronto": IdraulicaPronto,
  "barber-shop": BarberShop,
  barber: BarberShop,
  uomo: UomoSalone,
  donna: DonnaSalone,
  unisex: UnisexSalone,
  modern: ModernSalone,
};

/** Pick the template by stored id, falling back to the preset default, then Editorial. */
export function resolveTemplate(name: string | null | undefined, preset: ThemePreset): FC<DemoProps> {
  if (name && DEMO_TEMPLATES[name]) return DEMO_TEMPLATES[name];
  return DEMO_TEMPLATES[defaultTemplateForPreset(preset)] ?? Editorial;
}
