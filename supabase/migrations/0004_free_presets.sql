-- Allow free (£0) presets so creators can list giveaways for SEO / lead-gen.
-- The original constraint required price_cents > 0.
alter table presets drop constraint if exists presets_price_cents_check;
alter table presets add constraint presets_price_cents_check check (price_cents >= 0);
