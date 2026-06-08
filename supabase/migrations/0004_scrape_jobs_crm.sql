-- Self-service scraping jobs + mini-CRM notes.
create table scrape_jobs (
  id uuid primary key default gen_random_uuid(),
  city text,
  category text,
  params jsonb not null default '{}'::jsonb,
  apify_run_id text,
  dataset_id text,
  status text not null default 'pending',   -- pending|running|done|error
  lead_count int not null default 0,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index scrape_jobs_status_idx on scrape_jobs(status);
create trigger scrape_jobs_touch before update on scrape_jobs
  for each row execute function touch_updated_at();
alter table scrape_jobs enable row level security;

alter table leads add column if not exists notes text;
