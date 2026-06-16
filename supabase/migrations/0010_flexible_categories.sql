-- Flexible categories: drop the fixed CHECK so sellers can use any category
-- (curated suggestions + custom ones). The browse filter is derived from the
-- categories actually used on published presets.
alter table presets drop constraint if exists presets_category_check;
