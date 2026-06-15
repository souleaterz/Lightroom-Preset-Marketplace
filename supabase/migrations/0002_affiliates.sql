-- Affiliate program: members can become affiliates and earn a share of the
-- platform fee from creators they onboard.
alter table profiles
  add column if not exists is_affiliate boolean default false,
  add column if not exists affiliate_code text,
  add column if not exists referred_by uuid references profiles(id);

-- Affiliate codes are unique when set.
create unique index if not exists idx_profiles_affiliate_code
  on profiles(affiliate_code) where affiliate_code is not null;

create index if not exists idx_profiles_referred_by on profiles(referred_by);
