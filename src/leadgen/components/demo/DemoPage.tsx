import type { OpeningHoursEntry, PageModel } from "@maps/core";
import { resolveTemplate } from "./templates/registry";

/**
 * Dispatcher: selects the layout template for a demo. `template` is the stored
 * lead.template id; when absent it falls back to the preset default (e.g. a
 * restaurant lead renders RistoranteClassic). Layout-only switch — no LLM.
 */
export function DemoPage({
  model,
  rating,
  reviewCount,
  template,
  photos,
  openingHours,
}: {
  model: PageModel;
  rating?: number | null;
  reviewCount?: number | null;
  template?: string | null;
  photos?: string[];
  openingHours?: OpeningHoursEntry[] | null;
}) {
  const Template = resolveTemplate(template, model.theme.preset);
  return (
    <Template
      model={model}
      rating={rating}
      reviewCount={reviewCount}
      photos={photos}
      openingHours={openingHours}
    />
  );
}
