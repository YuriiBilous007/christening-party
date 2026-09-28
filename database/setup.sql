-- Run once in your Supabase project's SQL Editor.
create table if not exists public.christening_rsvps (
  id uuid primary key,
  name text not null check (char_length(trim(name)) between 1 and 100),
  attendance text not null check (attendance in ('yes','no')),
  adults integer not null check (adults between 0 and 50),
  children_count integer not null check (children_count between 0 and 20),
  children_ages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  check (jsonb_typeof(children_ages) = 'array'),
  check (jsonb_array_length(children_ages) = children_count)
);
alter table public.christening_rsvps enable row level security;
revoke all on public.christening_rsvps from anon, authenticated;
grant select, insert, update on public.christening_rsvps to service_role;
