-- Distinguish mobile (WhatsApp-eligible) vs fixed-line numbers.
alter table public.leads add column if not exists phone_type text; -- 'mobile' | 'fixed' | 'other'
create index if not exists leads_phone_type_idx on public.leads(phone_type);
