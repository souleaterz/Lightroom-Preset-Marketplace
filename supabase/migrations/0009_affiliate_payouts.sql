-- Affiliate payouts: a commission ledger + payout records so affiliates can
-- cash out their share of platform fees via Stripe transfers (no double-paying).

-- One commission row per qualifying purchase (the affiliate's share of the fee).
create table if not exists affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references profiles(id) on delete cascade,
  purchase_id uuid references purchases(id) on delete cascade unique,
  creator_id uuid references profiles(id) on delete set null,
  amount_cents integer not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'reversed')),
  payout_id uuid,
  created_at timestamptz default now()
);
create index if not exists idx_aff_comm_affiliate on affiliate_commissions(affiliate_id, status);

-- One row per cash-out (a Stripe transfer to the affiliate's connected account).
create table if not exists affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references profiles(id) on delete cascade,
  amount_cents integer not null,
  stripe_transfer_id text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  created_at timestamptz default now()
);
create index if not exists idx_aff_payout_affiliate on affiliate_payouts(affiliate_id);

alter table affiliate_commissions enable row level security;
alter table affiliate_payouts enable row level security;

-- Affiliates can read their own ledger; all writes happen via the service role
-- (webhook records commissions, the payout API settles them).
create policy "Affiliates read own commissions" on affiliate_commissions
  for select using (affiliate_id = auth.uid());
create policy "Affiliates read own payouts" on affiliate_payouts
  for select using (affiliate_id = auth.uid());

-- Backfill commissions for past succeeded sales of referred creators, dated to
-- the original sale so the 30-day hold is computed correctly. Affiliate share is
-- half the platform fee (5% of 10%). Skips fee-free sales (nothing to share).
insert into affiliate_commissions (affiliate_id, purchase_id, creator_id, amount_cents, status, created_at)
select pr.referred_by,
       pu.id,
       pr.id,
       round((coalesce(pu.amount_cents, 0) - coalesce(pu.seller_payout_cents, 0)) * 0.5)::int,
       'pending',
       pu.created_at
from purchases pu
join presets ps on ps.id = pu.preset_id
join profiles pr on pr.id = ps.seller_id
where pu.status = 'succeeded'
  and pr.referred_by is not null
  and (coalesce(pu.amount_cents, 0) - coalesce(pu.seller_payout_cents, 0)) > 0
on conflict (purchase_id) do nothing;
