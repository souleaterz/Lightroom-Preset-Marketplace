-- Seller trust badges. `is_verified` is a manual trust flag (set by an admin via
-- SQL for now). The "Top Seller" badge is derived automatically from total_sales
-- in app code, so it needs no column.
alter table profiles add column if not exists is_verified boolean default false;
