-- Bundles / packs: a preset row can group other presets into a discounted pack.
-- Reusing the presets table means bundles flow through browse, search, wishlist,
-- reviews, seller pages, checkout and the sitemap with no extra plumbing.
alter table presets add column if not exists bundle_preset_ids uuid[];

-- A bundle has no single downloadable file of its own (its files come from the
-- presets it contains), so file_path / file_name must be nullable.
alter table presets alter column file_path drop not null;
alter table presets alter column file_name drop not null;
