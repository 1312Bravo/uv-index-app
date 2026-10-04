import definitions from './uvCategories.json';

export type UvCategory = 'low' | 'moderate' | 'high' | 'very-high' | 'extreme';

export type UvCategoryInfo = {
  key: UvCategory;
  label: string;
};

type CategoryDefinition = UvCategoryInfo & { minimumUvInclusive: number };

function isCategoryKey(key: string): key is UvCategory {
  return ['low', 'moderate', 'high', 'very-high', 'extreme'].includes(key);
}

// Check editable data once so a malformed table cannot silently misclassify UV.
const categories: CategoryDefinition[] = definitions.map((definition, index) => {
  const { key, label, minimumUvInclusive } = definition;
  if (
    !isCategoryKey(key) || !label.trim() ||
    !Number.isFinite(minimumUvInclusive) ||
    (index === 0 ? minimumUvInclusive !== 0 : minimumUvInclusive <= definitions[index - 1].minimumUvInclusive) ||
    definitions.slice(0, index).some((previous) => previous.key === key)
  ) {
    throw new Error(`Invalid UV category definition at row ${index + 1}.`);
  }
  return { key, label, minimumUvInclusive };
});

if (categories.length !== 5) throw new Error('UV categories must contain all five category keys.');

export function getUvCategory(uv: number): UvCategoryInfo {
  if (!Number.isFinite(uv) || uv < 0) throw new Error('UV Index must be a finite, non-negative number.');

  // Classify the nearest whole UV Index, with .5 rounding up (product decision).
  const roundedUv = Math.round(uv);
  // Each row applies until the next row's minimum; the final row has no upper limit.
  const category = categories.findLast((entry) => roundedUv >= entry.minimumUvInclusive)!;
  return { key: category.key, label: category.label };
}
