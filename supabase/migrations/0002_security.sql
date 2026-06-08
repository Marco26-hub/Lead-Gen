-- Lock all tables to server-only access: RLS ON with NO policies => anon/authenticated
-- are fully denied; the service-role key (used only server-side) bypasses RLS.
alter table public.leads            enable row level security;
alter table public.outreach_events  enable row level security;
alter table public.unsubscribes     enable row level security;
alter table public.jobs             enable row level security;
alter table public.app_flags        enable row level security;

-- Harden trigger function search_path (advisor: function_search_path_mutable).
alter function public.touch_updated_at() set search_path = '';
