/**
 * Categories are free-form. Sellers pick from the curated suggestions below or
 * type their own; the browse filter is built from the categories actually used
 * on published presets. Stored values are normalized slugs (e.g. "black-and-white").
 */

export interface Category {
  value: string
  label: string
}

/** Normalize any category input to a stored slug. "Light & Airy" -> "light-and-airy". */
export function normalizeCategory(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Curated suggestion labels (shown in the upload datalist). Values are derived
// via normalizeCategory so a picked suggestion and a typed match collapse to one.
const CURATED_LABELS = [
  'Portrait', 'Landscape', 'Street', 'Urban', 'Architecture', 'Real Estate',
  'Interior Design', 'Product', 'Food', 'Wedding', 'Newborn', 'Lifestyle',
  'Aesthetic', 'Film', 'Cinematic', 'Vintage', 'Moody', 'Bright', 'Light & Airy',
  'Matte', 'Pastel', 'Natural', 'Black & White', 'Travel', 'Outdoor', 'Beach',
  'Sunset', 'Summer', 'Spring', 'Autumn', 'Winter', 'Snow', 'Christmas', 'Hiking',
  'Forest', 'Underwater', 'Astrophotography', 'Night', 'Cars', 'Sport',
  'Gym & Fitness', 'GoPro', 'Animals',
]

export const CURATED_CATEGORIES: Category[] = CURATED_LABELS.map((label) => ({
  value: normalizeCategory(label),
  label,
}))

const LABEL_BY_VALUE = new Map(CURATED_CATEGORIES.map((c) => [c.value, c.label]))
const ORDER_BY_VALUE = new Map(CURATED_CATEGORIES.map((c, i) => [c.value, i]))

/** Human label for a stored category value (curated label, else title-cased). */
export function categoryLabel(value?: string | null): string {
  if (!value) return ''
  const known = LABEL_BY_VALUE.get(value)
  if (known) return known
  return value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/** Build a deduped, ordered category list from raw stored values. */
export function toCategoryList(values: (string | null | undefined)[]): Category[] {
  const uniq = Array.from(new Set(values.filter((v): v is string => !!v)))
  return uniq
    .map((value) => ({ value, label: categoryLabel(value) }))
    .sort((a, b) => {
      const ia = ORDER_BY_VALUE.has(a.value) ? ORDER_BY_VALUE.get(a.value)! : Infinity
      const ib = ORDER_BY_VALUE.has(b.value) ? ORDER_BY_VALUE.get(b.value)! : Infinity
      if (ia !== ib) return ia - ib
      return a.label.localeCompare(b.label)
    })
}
