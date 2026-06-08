-- Abbonamenti Stripe per cliente pagante.
-- Una lead può avere più subscriptions parallele (es. Landing Smart + Social Manager + Reviews).
-- Lo stato 'paying' del lead riassume "almeno una subscription active" (calcolato server-side).

-- Aggiungo valori enum a lead_status PRIMA di tutto (Postgres permette di usarli
-- subito dopo l'add in PG12+, ma li teniamo come step separato per chiarezza).
alter type public.lead_status add value if not exists 'trialing';
alter type public.lead_status add value if not exists 'paying';
alter type public.lead_status add value if not exists 'churned';

do $$ begin
  create type subscription_status as enum (
    'trialing',     -- trial manuale 14gg senza carta
    'active',       -- abbonamento attivo, pagato
    'past_due',     -- pagamento fallito, in retry
    'canceled',     -- annullato dal cliente
    'incomplete'    -- checkout iniziato ma non concluso
  );
exception when duplicate_object then null; end $$;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  -- Quale pacchetto (es. 'ristorante-growth', 'salone-premium', 'idraulico-starter')
  -- o singolo modulo (es. 'social-multi-canale', 'reviews-pro').
  package_id text not null,
  -- Mensile vs annuale
  billing_period text not null default 'monthly' check (billing_period in ('monthly', 'annual')),
  -- Riferimenti Stripe (null durante trial manuale, popolati post-checkout)
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,
  -- Stato
  status subscription_status not null default 'trialing',
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  -- Audit
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_lead_id_idx on public.subscriptions(lead_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);
create index if not exists subscriptions_stripe_sub_idx on public.subscriptions(stripe_subscription_id)
  where stripe_subscription_id is not null;

drop trigger if exists subscriptions_touch_updated_at on public.subscriptions;
create trigger subscriptions_touch_updated_at
  before update on public.subscriptions
  for each row execute function public.touch_updated_at();

alter table public.subscriptions enable row level security;

-- Webhook idempotency: ogni evento Stripe può arrivare al massimo 2 volte (retry).
create table if not exists public.webhook_events (
  id text primary key,             -- es. 'evt_1ABC...' direttamente da Stripe
  provider text not null,          -- 'stripe' | 'twilio' | 'apify' | 'resend'
  type text not null,              -- es. 'customer.subscription.created'
  processed_at timestamptz not null default now(),
  payload jsonb
);

create index if not exists webhook_events_provider_type_idx on public.webhook_events(provider, type);

alter table public.webhook_events enable row level security;
