import definitions from './europeanAqiCategories.json';

export type EuropeanAqiCategoryKey =
  | 'good'
  | 'fair'
  | 'moderate'
  | 'poor'
  | 'very-poor'
  | 'extremely-poor';

export type EuropeanAqiCategory = {
  key: EuropeanAqiCategoryKey;
  label: string;
  meaning: string;
  generalAdvice: string;
  sensitiveAdvice: string;
};

export type EuropeanAqiCategoryDefinition = EuropeanAqiCategory & {
  minimum: number;
  minimumInclusive: boolean;
};

function isCategoryKey(key: string): key is EuropeanAqiCategoryKey {
  return [
    'good',
    'fair',
    'moderate',
    'poor',
    'very-poor',
    'extremely-poor',
  ].includes(key);
}

const categoryOrder: EuropeanAqiCategoryKey[] = [
  'good',
  'fair',
  'moderate',
  'poor',
  'very-poor',
  'extremely-poor',
];

const categories: EuropeanAqiCategoryDefinition[] = definitions.map((definition, index) => {
  const { key, label, meaning, generalAdvice, sensitiveAdvice, minimum, minimumInclusive } = definition;
  if (
    !isCategoryKey(key) || key !== categoryOrder[index] ||
    typeof label !== 'string' || !label.trim() ||
    typeof meaning !== 'string' || !meaning.trim() ||
    typeof generalAdvice !== 'string' || !generalAdvice.trim() ||
    typeof sensitiveAdvice !== 'string' || !sensitiveAdvice.trim() ||
    !Number.isFinite(minimum) || minimum < 0 ||
    typeof minimumInclusive !== 'boolean' ||
    (index === 0 ? minimum !== 0 || !minimumInclusive : minimum <= definitions[index - 1].minimum) ||
    definitions.slice(0, index).some((previous) => previous.key === key) ||
    (index < definitions.length - 1 && !minimumInclusive) ||
    (index === definitions.length - 1 && minimumInclusive)
  ) {
    throw new Error(`Invalid European AQI category definition at row ${index + 1}.`);
  }
  return { key, label, meaning, generalAdvice, sensitiveAdvice, minimum, minimumInclusive };
});

if (categories.length !== 6) {
  throw new Error('European AQI categories must contain all six category keys.');
}

export function getEuropeanAqiCategory(aqi: number): EuropeanAqiCategory {
  if (!Number.isFinite(aqi) || aqi < 0) {
    throw new Error('European AQI must be a finite, non-negative number.');
  }

  const category = categories.findLast(({ minimum, minimumInclusive }) =>
    minimumInclusive ? aqi >= minimum : aqi > minimum,
  );
  if (!category) throw new Error('European AQI has no matching category.');
  return {
    key: category.key,
    label: category.label,
    meaning: category.meaning,
    generalAdvice: category.generalAdvice,
    sensitiveAdvice: category.sensitiveAdvice,
  };
}

export function getEuropeanAqiCategoryDefinitions(): EuropeanAqiCategoryDefinition[] {
  return categories.map((category) => ({ ...category }));
}
