import type { OpeningHoursEntry, PageModel } from "@maps/core";

/**
 * Props every demo template receives. Content (`model`) is layout-agnostic;
 * `photos` and `openingHours` come from the lead row (not the LLM) and may be
 * ignored by templates that don't use them (e.g. Editorial).
 */
export interface DemoProps {
  model: PageModel;
  rating?: number | null;
  reviewCount?: number | null;
  photos?: string[];
  openingHours?: OpeningHoursEntry[] | null;
}
