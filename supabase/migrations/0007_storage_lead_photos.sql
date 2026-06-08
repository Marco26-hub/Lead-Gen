-- Public storage bucket for re-hosted lead photos (Instagram CDN URLs expire,
-- so the enrich-instagram stage downloads images and uploads them here, then
-- writes the public URLs into leads.photos).
--
-- public = true grants anon SELECT on objects in this bucket; writes go through
-- the service-role key, which bypasses RLS. No extra policies needed.
insert into storage.buckets (id, name, public)
values ('lead-photos', 'lead-photos', true)
on conflict (id) do update set public = excluded.public;
