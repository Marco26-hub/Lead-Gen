-- Backend prenotazioni reale (era demo-only).
-- Il BookingForm sulla demo /d/[slug] di un cliente paying ora salva qui,
-- e l'API /api/d/[slug]/book manda email al titolare + cliente.

do $$ begin
  create type booking_kind as enum (
    'reservation',  -- ristoranti: data + ora + coperti
    'appointment',  -- legale/medico: data + ora + servizio
    'booking',      -- beauty/gym: data + ora + servizio
    'quote',        -- artigiani: messaggio + email/tel
    'contact'       -- generico: messaggio
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum (
    'new',          -- appena ricevuta
    'confirmed',    -- titolare ha confermato
    'cancelled',    -- titolare o cliente ha cancellato
    'completed',    -- evento avvenuto
    'no_show'       -- cliente non si è presentato
  );
exception when duplicate_object then null; end $$;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  kind booking_kind not null,
  -- Quando (solo per kind con data)
  date date,
  time time,
  party_size int,
  service text,
  -- Chi
  name text not null,
  phone text,
  email text,
  message text,
  -- Stato
  status booking_status not null default 'new',
  -- Anti-spam
  source_ip inet,
  user_agent text,
  -- Audit
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_lead_id_idx on public.bookings(lead_id);
create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists bookings_date_idx on public.bookings(date) where date is not null;

drop trigger if exists bookings_touch_updated_at on public.bookings;
create trigger bookings_touch_updated_at
  before update on public.bookings
  for each row execute function public.touch_updated_at();

-- RLS: deny-all (servono solo letture server-side via service-role)
alter table public.bookings enable row level security;
