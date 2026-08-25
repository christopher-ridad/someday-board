-- Run this once in the Supabase SQL editor for a fresh project.
--
-- Already have this schema applied? Run these instead, to pick up columns
-- added since:
--   alter table items add column rotation numeric;                                  -- manual note-tilt control
--   alter table items add column track text not null default 'week'
--     check (track in ('week', 'month'));                                           -- which board (Week/Month) an item belongs to

create table items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users default auth.uid(),
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  position_x numeric,
  position_y numeric,
  rotation numeric,
  -- Which board this item belongs to — separate from claimed_track below,
  -- which tracks whether it's the *currently active* pulled challenge.
  track text not null default 'week' check (track in ('week', 'month')),
  claimed_track text check (claimed_track in ('week', 'month')),
  claimed_at timestamptz,
  claimed_due_by timestamptz
);

create table memories (
  item_id uuid primary key references items(id) on delete cascade,
  user_id uuid not null references auth.users default auth.uid(),
  note text,
  rating int,
  photo_path text,
  created_at timestamptz not null default now()
);

alter table items enable row level security;
alter table memories enable row level security;

create policy "items are owner-only" on items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "memories are owner-only" on memories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Private bucket for memory photos. Objects are stored at `${user_id}/${item_id}.jpg`.
insert into storage.buckets (id, name, public) values ('memory-photos', 'memory-photos', false);

create policy "memory photos are owner-only" on storage.objects
  for all using (bucket_id = 'memory-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'memory-photos' and (storage.foldername(name))[1] = auth.uid()::text);
