-- Seller-defined discount codes. A code applies to all of that seller's presets;
-- buyers enter it at checkout for a percentage off.
create table if not exists discount_codes (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references profiles(id) on delete cascade,
  code text not null,
  percent_off integer not null check (percent_off between 1 and 100),
  max_uses integer,                 -- null = unlimited
  times_used integer default 0,
  expires_at timestamptz,           -- null = never expires
  is_active boolean default true,
  created_at timestamptz default now(),
  unique (seller_id, code)
);

create index if not exists idx_discount_codes_seller on discount_codes(seller_id);

alter table discount_codes enable row level security;

-- Sellers manage only their own codes. Validation at checkout uses the service
-- role (admin client), so buyers never need read access.
create policy "Sellers manage own discount codes" on discount_codes
  for all using (seller_id = auth.uid()) with check (seller_id = auth.uid());

-- Atomic, capped usage increment. Returns true if a use was recorded.
create or replace function redeem_discount_code(code_id uuid)
returns boolean language plpgsql security definer as $$
declare
  ok boolean;
begin
  update discount_codes
    set times_used = times_used + 1
    where id = code_id
      and is_active = true
      and (max_uses is null or times_used < max_uses)
      and (expires_at is null or expires_at > now())
    returning true into ok;
  return coalesce(ok, false);
end;
$$;
