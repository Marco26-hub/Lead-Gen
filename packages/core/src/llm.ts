import OpenAI from 'openai';
import { env, requireEnv } from './config';
import { PageModelSchema, THEME_PRESETS, RESTAURANT_STYLES, SALON_STYLES, type PageModel } from './schemas';
import type { LeadRow, ReviewItem } from './types';

/**
 * Site-generation via OpenRouter (OpenAI-compatible) function calling.
 * Lives in core (not the barrel index) so both the orchestrator and the web app
 * can call it; NOT re-exported from index to keep `openai` out of client bundles.
 * Import as `@maps/core/llm`.
 */

const TOOL_PARAMETERS = {
  type: 'object',
  properties: {
    meta: {
      type: 'object',
      properties: {
        businessName: { type: 'string' },
        category: { type: 'string' },
        tagline: { type: 'string' },
        lang: { type: 'string', enum: ['it'] },
      },
      required: ['businessName', 'category', 'tagline', 'lang'],
    },
    theme: {
      type: 'object',
      properties: { preset: { type: 'string', enum: [...THEME_PRESETS] } },
      required: ['preset'],
    },
    restaurantStyle: {
      type: 'string',
      enum: [...RESTAURANT_STYLES],
      description: 'Solo per ristoranti: sotto-stile (pizzeria/pesce/carne/etnico/classic). Omettere per altre categorie.',
    },
    salonStyle: {
      type: 'string',
      enum: [...SALON_STYLES],
      description: 'Solo per parrucchieri/barbieri/saloni: sotto-stile (barber/uomo/donna/modern/unisex). Omettere per altre categorie.',
    },
    hero: {
      type: 'object',
      properties: { headline: { type: 'string' }, sub: { type: 'string' }, ctaLabel: { type: 'string' } },
      required: ['headline', 'sub', 'ctaLabel'],
    },
    services: {
      type: 'array',
      minItems: 3,
      maxItems: 6,
      items: {
        type: 'object',
        properties: { title: { type: 'string' }, desc: { type: 'string' } },
        required: ['title', 'desc'],
      },
    },
    testimonials: {
      type: 'array',
      maxItems: 3,
      items: {
        type: 'object',
        properties: { quote: { type: 'string' }, author: { type: 'string' }, rating: { type: 'number' } },
        required: ['quote', 'author'],
      },
    },
    about: {
      type: 'object',
      properties: { title: { type: 'string' }, body: { type: 'string' } },
      required: ['title', 'body'],
    },
    contact: {
      type: 'object',
      properties: {
        phone: { type: 'string' },
        address: { type: 'string' },
        ctaLabel: { type: 'string' },
        note: { type: 'string' },
      },
      required: ['ctaLabel'],
    },
    menu: {
      type: 'object',
      description: 'Solo per ristoranti/pizzerie/trattorie/osterie: carta di esempio. Omettere per le altre categorie.',
      properties: {
        note: { type: 'string' },
        sections: {
          type: 'array',
          minItems: 1,
          maxItems: 6,
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              items: {
                type: 'array',
                minItems: 1,
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    desc: { type: 'string' },
                    price: { type: 'string' },
                  },
                  required: ['name'],
                },
              },
            },
            required: ['name', 'items'],
          },
        },
      },
      required: ['sections'],
    },
  },
  required: ['meta', 'theme', 'hero', 'services', 'about', 'contact'],
} as const;

const SYSTEM = `Sei un web designer e copywriter italiano. Generi SOLO il modello JSON di una landing page moderna per una piccola attività locale, chiamando la funzione emit_page_model.
Regole:
- Scrivi tutto in italiano, tono professionale e caldo.
- Usa le recensioni reali fornite come testimonial: cita il testo TESTUALMENTE (massimo 3, scegli le migliori). Non inventare recensioni.
- Scegli theme.preset in base alla categoria merceologica (es. ristorante→restaurant, avvocato/notaio/commercialista→lawyer, palestra→gym, parrucchiere/estetista→beauty, dentista/medico→medical, negozio→retail, idraulico/elettricista/artigiano→artisan, altrimenti default).
- 3-6 servizi plausibili per la categoria. Non inventare premi, numeri o certificazioni non forniti.
- Headline breve e incisiva. CTA orientata all'azione (es. "Prenota un tavolo", "Richiedi un preventivo").
- Se la categoria è ristorante/pizzeria/trattoria/osteria/braceria, includi anche "menu": 3-4 sezioni (tipicamente Antipasti, Primi, Secondi, Dolci) con 3-5 piatti plausibili ciascuna, descrizione breve e prezzo indicativo in euro come stringa (es. "€12"). È un menù di esempio dimostrativo coerente con la cucina locale; in "menu.note" precisa che è un esempio. Per le altre categorie OMETTI del tutto "menu".
- Se è un ristorante, imposta "restaurantStyle" in base a cucina/ambiente: pizzeria→"pizzeria"; pesce/crudi/frutti di mare/ristorante sul mare→"pesce"; carne/brace/griglia/steakhouse/braceria/ristorante di montagna→"carne"; cinese/giapponese/sushi/asiatico/etnico/fusion→"etnico"; trattoria/osteria/cucina italiana generica/agriturismo→"classic". Per le altre categorie OMETTI "restaurantStyle".
- Se è un parrucchiere/barbiere/salone, imposta "salonStyle" in base a target/stile: barbiere/barber shop/rasatura uomo→"barber"; salone o parrucchiere SOLO uomo (non barbiere)→"uomo"; salone o parrucchiere SOLO donna→"donna"; salone moderno/concept/d'avanguardia/luxury/hair lab→"modern"; parrucchiere unisex/misto uomo-donna o generico→"unisex". Per le altre categorie OMETTI "salonStyle".`;

function buildUserContent(lead: LeadRow, reviews: ReviewItem[]): string {
  return JSON.stringify({
    business_name: lead.business_name,
    category: lead.category ?? 'attività locale',
    address: lead.address ?? undefined,
    phone: lead.phone_e164 ?? undefined,
    rating: lead.rating ?? undefined,
    review_count: lead.review_count ?? undefined,
    reviews: reviews.map((r) => ({ text: r.text, author: r.author, rating: r.rating })),
  });
}

function client(): OpenAI {
  const headers: Record<string, string> = { 'X-Title': env.OPENROUTER_APP_NAME };
  if (env.OPENROUTER_SITE_URL) headers['HTTP-Referer'] = env.OPENROUTER_SITE_URL;
  return new OpenAI({
    apiKey: requireEnv('OPENROUTER_API_KEY'),
    baseURL: env.OPENROUTER_BASE_URL,
    defaultHeaders: headers,
  });
}

/** Generate a validated PageModel for a lead using the given OpenRouter model. Retries once. */
export async function generatePageModel(lead: LeadRow, model: string): Promise<PageModel> {
  const openai = client();
  const reviews = ((lead.reviews ?? []) as ReviewItem[]).filter((r) => r.text).slice(0, 5);
  const userContent = buildUserContent(lead, reviews);

  const tools = [
    {
      type: 'function' as const,
      function: {
        name: 'emit_page_model',
        description: 'Restituisci il modello JSON della landing page.',
        parameters: TOOL_PARAMETERS as unknown as Record<string, unknown>,
      },
    },
  ];

  let lastErr: unknown;
  // Attempt 0 forces the tool; later attempts use 'auto' so models that reject forced
  // tool_choice (e.g. Qwen "thinking mode") still work. Also retries transient provider errors.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const completion = await openai.chat.completions.create({
        model,
        temperature: 0.4,
        max_tokens: 2000,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: userContent },
        ],
        tools,
        tool_choice:
          attempt === 0 ? { type: 'function', function: { name: 'emit_page_model' } } : 'auto',
      });

      const call = completion.choices[0]?.message?.tool_calls?.[0];
      if (!call || call.type !== 'function') throw new Error('nessun tool_call nella risposta del modello');
      const args: unknown = JSON.parse(call.function.arguments);
      const parsed = PageModelSchema.safeParse(args);
      if (parsed.success) return parsed.data;
      lastErr = parsed.error;
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(`generatePageModel failed: ${describeError(lastErr)}`);
}

function describeError(e: unknown): string {
  const anyE = e as { error?: unknown; message?: string } | null;
  if (anyE && anyE.error) return JSON.stringify(anyE.error).slice(0, 600);
  return anyE?.message ?? String(e);
}
