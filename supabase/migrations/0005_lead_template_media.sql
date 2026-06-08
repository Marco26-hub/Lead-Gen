-- Per-category demo templates + real media captured from Google Maps.
-- template: layout id chosen for the demo (null → preset default at render time).
-- photos: image URLs from Apify (hero + gallery).
-- opening_hours: [{ day, hours }] from Apify.
alter table leads add column if not exists template text;
alter table leads add column if not exists photos jsonb not null default '[]'::jsonb;
alter table leads add column if not exists opening_hours jsonb;
