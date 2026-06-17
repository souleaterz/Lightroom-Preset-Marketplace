-- Founder badge: a manual flag for founding creators (the first sellers onboarded).
-- Set via SQL, e.g. update profiles set is_founder = true where username = '...';
alter table profiles add column if not exists is_founder boolean default false;
