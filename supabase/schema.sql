-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  stripe_account_id text,
  stripe_account_status text check (stripe_account_status in ('pending', 'active', 'restricted')),
  total_sales integer default 0,
  created_at timestamptz default now()
);

-- Presets
create table if not exists presets (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  price_cents integer not null check (price_cents > 0),
  category text check (category in ('portrait', 'landscape', 'street', 'film', 'moody', 'bright')),
  tags text[],
  before_image_url text not null,
  after_image_url text not null,
  additional_demo_pairs jsonb,
  file_path text not null,
  file_name text not null,
  downloads integer default 0,
  rating_avg numeric(3,2) default 0,
  rating_count integer default 0,
  is_published boolean default false,
  created_at timestamptz default now()
);

-- Purchases
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references profiles(id),
  preset_id uuid references presets(id),
  stripe_payment_intent_id text unique,
  amount_cents integer,
  seller_payout_cents integer,
  status text default 'pending' check (status in ('pending', 'succeeded', 'refunded')),
  created_at timestamptz default now()
);

-- Reviews
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references profiles(id),
  preset_id uuid references presets(id),
  purchase_id uuid references purchases(id),
  rating integer check (rating between 1 and 5),
  body text,
  created_at timestamptz default now(),
  unique(buyer_id, preset_id)
);

-- Wishlists
create table if not exists wishlists (
  user_id uuid references profiles(id),
  preset_id uuid references presets(id),
  created_at timestamptz default now(),
  primary key (user_id, preset_id)
);

-- RLS Policies
alter table profiles enable row level security;
alter table presets enable row level security;
alter table purchases enable row level security;
alter table reviews enable row level security;
alter table wishlists enable row level security;

-- Profiles
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Presets
create policy "Published presets viewable by everyone" on presets for select using (is_published = true or seller_id = auth.uid());
create policy "Sellers can insert own presets" on presets for insert with check (seller_id = auth.uid());
create policy "Sellers can update own presets" on presets for update using (seller_id = auth.uid());
create policy "Sellers can delete own presets" on presets for delete using (seller_id = auth.uid());

-- Purchases
create policy "Buyers can view own purchases" on purchases for select using (buyer_id = auth.uid() or preset_id in (select id from presets where seller_id = auth.uid()));
create policy "Purchases can be inserted by service role" on purchases for insert with check (true);
create policy "Purchases can be updated by service role" on purchases for update using (true);

-- Reviews
create policy "Reviews viewable by everyone" on reviews for select using (true);
create policy "Authenticated users can insert reviews" on reviews for insert with check (auth.uid() = buyer_id);

-- Wishlists
create policy "Users can view own wishlist" on wishlists for select using (auth.uid() = user_id);
create policy "Users can manage own wishlist" on wishlists for insert with check (auth.uid() = user_id);
create policy "Users can delete from own wishlist" on wishlists for delete using (auth.uid() = user_id);

-- Helper functions
create or replace function increment_downloads(preset_id uuid)
returns void language plpgsql security definer as $$
begin
  update presets set downloads = downloads + 1 where id = preset_id;
end;
$$;

create or replace function increment_seller_sales(seller_id uuid)
returns void language plpgsql security definer as $$
begin
  update profiles set total_sales = total_sales + 1 where id = seller_id;
end;
$$;

-- Indexes for performance
create index if not exists idx_presets_is_published on presets(is_published);
create index if not exists idx_presets_seller_id on presets(seller_id);
create index if not exists idx_presets_category on presets(category);
create index if not exists idx_purchases_buyer_id on purchases(buyer_id);
create index if not exists idx_purchases_preset_id on purchases(preset_id);
create index if not exists idx_reviews_preset_id on reviews(preset_id);
