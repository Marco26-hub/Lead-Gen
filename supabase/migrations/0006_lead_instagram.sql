-- Instagram enrichment.
-- instagram_handle is the IG username (no leading @, no URL) extracted during
-- scrape from one of: actor `socials.instagram[0]`, `instagrams[0]`, or the
-- business website if it points to instagram.com/<handle>. Only leads that
-- already have a handle are eligible for the enrich-instagram stage.
alter table public.leads add column if not exists instagram_handle text;

-- Partial index makes the "is this lead enrichable?" check cheap.
create index if not exists leads_instagram_handle_idx
  on public.leads(instagram_handle)
  where instagram_handle is not null;
