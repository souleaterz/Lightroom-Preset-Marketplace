-- Let presets be deleted even when they're wishlisted or reviewed, by cascading
-- those dependent rows. Purchases are intentionally NOT cascaded so completed
-- sales and buyer library access are preserved (the app blocks deleting sold
-- presets and asks the seller to unpublish instead).
--
-- NOTE: deletion already works without this migration — app/dashboard/presets/
-- actions.ts clears the dependent rows server-side. This keeps the DB schema
-- correct for any direct delete.

alter table wishlists drop constraint if exists wishlists_preset_id_fkey;
alter table wishlists
  add constraint wishlists_preset_id_fkey
  foreign key (preset_id) references presets(id) on delete cascade;

alter table reviews drop constraint if exists reviews_preset_id_fkey;
alter table reviews
  add constraint reviews_preset_id_fkey
  foreign key (preset_id) references presets(id) on delete cascade;
