# Social Web Automation

App unica Next.js che fonde **sito agenzia** (marketing IT/EN + admin) e
**sistema di lead generation** (scraping Google Maps → demo AI → outreach →
billing), su **un solo dominio** (socialwebautomation.com) e **un solo
database Supabase**. Tutti i lead — scraping + form del sito — vivono in
`public.leads` e si gestiscono in un unico posto: la dashboard `/app`.

## Stack

- **Next.js 16** (App Router) · **TypeScript** · **Tailwind CSS v4** · **React 19**
- **Better Auth** — login unico per `/admin` (sito) e `/app` (lead-gen)
- **Drizzle ORM + `pg`** — tabelle sito in schema Postgres `agency`
- **`@supabase/supabase-js`** — tabelle lead-gen in schema `public` + Storage
- **Three.js / Framer Motion / Lenis** — sito marketing
- **pnpm workspace** — `@maps/core` (logica lead-gen) + `@maps/orchestrator` (CLI pipeline)

## Mappa delle route

| Area | Path | Auth |
| --- | --- | --- |
| Marketing IT/EN | `/`, `/[lang]/*` | pubblica |
| Admin sito (clienti, appuntamenti) | `/admin/*` | Better Auth |
| Gestionale lead (scraping + sito) | `/app/*` | Better Auth |
| Demo prospect | `/d/[slug]` | pubblica |
| Ritorni Stripe | `/billing/{success,cancel}` | pubblica |
| API sito | `/api/auth`, `/api/contact` | — |
| API lead-gen + webhook | `/api/{leads,scrape,og,d,billing,unsubscribe,webhooks}/*` | webhook firmati / sessione |

## Struttura

```
src/app/            route fuse (marketing + admin + /app dashboard + /d + api)
src/components/      UI sito
src/leadgen/         codice app lead-gen (components, lib) — alias @/leadgen/*
src/lib/             db (Drizzle), auth, admin, i18n, seo
packages/core/       @maps/core — supabase, scrape, llm, stripe, storage…
packages/orchestrator/  @maps/orchestrator — pipeline CLI (gira ESTERNA a Vercel)
supabase/migrations/ schema lead-gen (public) + 0010_inbound_leads
drizzle/             migrazioni schema `agency` (rigenerate con db:generate)
```

## Sviluppo

```bash
pnpm install
# DB: vedi .env.example. Crea lo schema agency e applica le migrazioni:
#   psql/SQL editor:  create schema if not exists agency;
pnpm db:generate && pnpm db:migrate   # tabelle sito in schema `agency`
pnpm db:seed                          # primo admin (Better Auth)
pnpm dev                              # http://localhost:3000
pnpm build                            # build produzione
```

Le migrazioni lead-gen (`public.*`) sono già applicate sul Supabase esistente;
`0010_inbound_leads.sql` aggiunge `source`, lo stato `inbound` e rende `place_id`
nullable per accogliere i lead del form sito.

## Pipeline lead-gen (esterna)

Gira fuori da Vercel, punta allo stesso Supabase:

```bash
pnpm pipeline:scrape
pnpm pipeline:classify
pnpm pipeline:generate
pnpm pipeline:outreach
```

I lead del form sito (`source='website'`, `status='inbound'`) sono esclusi dalla
pipeline (ogni stage filtra `source='maps'`).

## Deploy

Un solo progetto Vercel (root = questo repo, build `next build`, Node ≥20, pnpm).
Dominio `socialwebautomation.com`. Variabili: vedi `.env.example`. I webhook dei
provider (Stripe/Apify/Resend/Twilio) vanno puntati a
`https://socialwebautomation.com/api/webhooks/...`.
