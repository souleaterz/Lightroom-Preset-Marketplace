-- Follow sellers: buyers follow a creator and get emailed on new releases.
create table if not exists follows (
  follower_id uuid references profiles(id) on delete cascade,
  seller_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, seller_id)
);
create index if not exists idx_follows_seller on follows(seller_id);

alter table follows enable row level security;

-- Follows aren't sensitive (like a public follow graph): readable by all so we
-- can show follower counts and "following" state. Users manage only their own.
create policy "Follows are viewable by everyone" on follows for select using (true);
create policy "Users can follow" on follows for insert with check (follower_id = auth.uid());
create policy "Users can unfollow" on follows for delete using (follower_id = auth.uid());

-- Ensure a preset only ever triggers one "new release" email blast, even if it
-- is unpublished and republished or edited again later.
alter table presets add column if not exists new_release_notified boolean default false;
