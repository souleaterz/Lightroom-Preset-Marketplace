-- Add buyer/seller distinction. Everyone starts as a buyer (is_seller = false)
-- and opts in to selling via the "Become a Seller" flow.
alter table profiles
  add column if not exists is_seller boolean default false;

-- Treat anyone who already onboarded with Stripe or has presets as a seller,
-- so existing accounts aren't locked out of their dashboard after this change.
update profiles
  set is_seller = true
  where stripe_account_id is not null
     or id in (select distinct seller_id from presets);
