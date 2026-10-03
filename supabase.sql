-- Fluent: progreso del alumno y uso del tutor (mismo proyecto de Supabase).
create table if not exists public.en_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}',
  last_day date, streak int not null default 0, remind_time text default '19:00',
  sent jsonb not null default '{}', updated_at timestamptz not null default now()
);
create table if not exists public.en_tutor_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null, created_at timestamptz not null default now()
);
create index if not exists en_tutor_usage_user_day on public.en_tutor_usage(user_id, day);
alter table public.en_state enable row level security;
alter table public.en_tutor_usage enable row level security;
create policy en_state_own on public.en_state for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy en_tutor_own on public.en_tutor_usage for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
