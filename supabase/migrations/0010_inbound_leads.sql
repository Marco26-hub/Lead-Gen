-- 0010_inbound_leads — accogli i lead inbound (form del sito) nella tabella
-- public.leads condivisa, così tutti i lead (scraping Google Maps + sito)
-- vivono in un unico elenco, taggati per provenienza.
--
-- NOTA Postgres: ALTER TYPE ... ADD VALUE non può essere usato nella stessa
-- transazione in cui il nuovo valore viene poi referenziato. Supabase CLI
-- esegue ogni file migration in una transazione: il nuovo valore 'inbound' è
-- aggiunto qui e usato solo a runtime dall'app (insert del form), mai in questo
-- file — quindi è sicuro.

-- Nuovo stato per i lead arrivati dal form del sito (fuori dalla pipeline).
alter type public.lead_status add value if not exists 'inbound';

-- Provenienza del lead: 'maps' (scraping, default per le righe esistenti) | 'website'.
alter table public.leads add column if not exists source text not null default 'maps';

-- I lead inbound non hanno un place_id Google Maps.
alter table public.leads alter column place_id drop not null;

-- Filtro/contatori per provenienza in dashboard.
create index if not exists leads_source_idx on public.leads(source);
