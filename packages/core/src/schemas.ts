import { z } from 'zod';

/** Visual style presets — Claude picks the LABEL; the server applies palette/font (see theme-presets.ts). */
export const THEME_PRESETS = [
  'restaurant',
  'lawyer',
  'gym',
  'beauty',
  'medical',
  'retail',
  'artisan',
  'default',
] as const;
export type ThemePreset = (typeof THEME_PRESETS)[number];

/** Restaurant sub-style → drives which restaurant template is proposed. */
export const RESTAURANT_STYLES = ['classic', 'pizzeria', 'pesce', 'carne', 'etnico'] as const;
export type RestaurantStyle = (typeof RESTAURANT_STYLES)[number];

/** Salon/hairdresser sub-style → drives which beauty template is proposed. */
export const SALON_STYLES = ['unisex', 'barber', 'uomo', 'donna', 'modern'] as const;
export type SalonStyle = (typeof SALON_STYLES)[number];

/**
 * The JSON contract binding Claude ↔ DB ↔ renderer.
 * Claude returns ONLY semantic content + a theme preset label; no raw colors.
 */
export const PageModelSchema = z.object({
  meta: z.object({
    businessName: z.string().min(1),
    category: z.string().min(1),
    tagline: z.string().min(1),
    lang: z.literal('it').default('it'),
  }),
  theme: z.object({
    preset: z.enum(THEME_PRESETS),
  }),
  /** Solo per ristoranti: sotto-stile per scegliere il template (pizzeria, pesce, carne, etnico…). */
  restaurantStyle: z.enum(RESTAURANT_STYLES).optional(),
  /** Solo per parrucchieri/saloni: sotto-stile per scegliere il template (barber, uomo, donna, modern, unisex). */
  salonStyle: z.enum(SALON_STYLES).optional(),
  hero: z.object({
    headline: z.string().min(1),
    sub: z.string().min(1),
    ctaLabel: z.string().min(1),
  }),
  services: z
    .array(z.object({ title: z.string().min(1), desc: z.string().min(1) }))
    .min(3)
    .max(6),
  testimonials: z
    .array(
      z.object({
        quote: z.string().min(1),
        author: z.string().min(1),
        rating: z.number().min(1).max(5).optional(),
      }),
    )
    .max(3)
    .default([]),
  about: z.object({ title: z.string().min(1), body: z.string().min(1) }),
  contact: z.object({
    phone: z.string().optional(),
    address: z.string().optional(),
    ctaLabel: z.string().min(1),
    note: z.string().optional(),
  }),
  /**
   * Optional category-specific sections. Templates that don't need them ignore them,
   * so other categories (and the Editorial layout) stay unaffected.
   * `menu` is currently used by the restaurant template (sample/demo dishes).
   */
  menu: z
    .object({
      note: z.string().optional(),
      sections: z
        .array(
          z.object({
            name: z.string().min(1),
            items: z
              .array(
                z.object({
                  name: z.string().min(1),
                  desc: z.string().optional(),
                  price: z.string().optional(),
                }),
              )
              .min(1),
          }),
        )
        .min(1)
        .max(6),
    })
    .optional(),
});

export type PageModel = z.infer<typeof PageModelSchema>;
