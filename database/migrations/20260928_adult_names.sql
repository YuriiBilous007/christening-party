-- Run in Supabase SQL Editor before deploying the new RSVP form.
-- Existing RSVP rows are preserved; unnamed companions remain NULL.
begin;
alter table public.christening_rsvps
  add column if not exists adult_2_name text,
  add column if not exists adult_3_name text,
  add column if not exists adult_4_name text;
-- NOT VALID preserves historical parties above four, but checks new writes.
alter table public.christening_rsvps drop constraint if exists rsvp_max_four_adults;
alter table public.christening_rsvps add constraint rsvp_max_four_adults
  check (adults between 0 and 4) not valid;
commit;
