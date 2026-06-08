-- 0001_init — Maps LeadGen schema
create extension if not exists pgcrypto;

-- enums
create type site_age_class as enum ('none','old','modern');
create type priority_t      as enum ('high','medium','low');
create type channel_t       as enum ('email','whatsapp');
create type job_status      as enum ('pending','claimed','done','error');
create type lead_status as enum (
  'scraped','enriched','classified','generated','deployed',
  'approved','queued_outreach','contacted','replied','unsubscribed','bounced','suppressed');

-- updated_at trigger helper
create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

-- leads (system of record)
create table leads (
  id uuid primary key default gen_random_uuid(),
  place_id text not null unique,            -- TRUE dedupe key (no-website leads have null domain)
  domain text unique,                       -- normalized host; secondary dedupe; nullable
  business_name text not null,
  category text,
  address text,
  phone_e164 text,
  email text,
  website_url text,
  rating numeric(2,1),
  review_count int,
  reachable boolean,
  http_status int,
  tech_stack jsonb not null default '{}'::jsonb,
  site_age_class site_age_class,
  priority priority_t,
  reviews jsonb not null default '[]'::jsonb,
  page_model jsonb,
  demo_url text,
  slug text unique,
  status lead_status not null default 'scraped',
  email_eligible boolean not null default false,
  consent_basis text,
  unsubscribe_token uuid not null default gen_random_uuid(),
  outreach_channel channel_t,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index leads_status_idx     on leads(status);
create index leads_priority_idx   on leads(priority);
create index leads_unsub_token_idx on leads(unsubscribe_token);
create trigger leads_touch before update on leads
  for each row execute function touch_updated_at();

-- per-send log (powers the <0.3% spam-rate monitor)
create table outreach_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  channel channel_t not null,
  template text,
  status text,                              -- queued|sent|delivered|opened|bounced|complained|failed
  provider_message_id text,
  spam_complaint boolean not null default false,
  error text,
  ts timestamptz not null default now()
);
create index outreach_events_status_idx on outreach_events(status);
create index outreach_events_ts_idx     on outreach_events(ts);
create index outreach_events_lead_idx   on outreach_events(lead_id);

-- suppression list
create table unsubscribes (
  id uuid primary key default gen_random_uuid(),
  email text,
  phone text,
  source text,                              -- link|complaint|manual
  ts timestamptz not null default now()
);
create unique index unsubscribes_email_idx on unsubscribes(lower(email)) where email is not null;
create unique index unsubscribes_phone_idx on unsubscribes(phone)        where phone is not null;

-- job queue (slow/paid stages: generate, outreach)
create table jobs (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  lead_id uuid references leads(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  status job_status not null default 'pending',
  attempts int not null default 0,
  last_error text,
  run_after timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index jobs_claim_idx on jobs(status, run_after);
create trigger jobs_touch before update on jobs
  for each row execute function touch_updated_at();

-- runtime flags (e.g. outreach auto-pause set by the spam monitor)
create table app_flags (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
