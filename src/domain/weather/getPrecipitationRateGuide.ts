import definitions from './precipitationRateGuide.json';

export type PrecipitationRateGuideEntry = {
  key: string;
  range: string;
  label: string;
  description: string;
};

const expectedKeys = ['none', 'light', 'moderate', 'heavy', 'very-intense'];

const entries: PrecipitationRateGuideEntry[] = definitions.map((entry) => {
  const { key, range, label, description } = entry;
  if (!key.trim() || !range.trim() || !label.trim() || !description.trim()) {
    throw new Error('Precipitation-rate guide entries must have readable text.');
  }
  return { key, range, label, description };
});

if (
  entries.length !== expectedKeys.length ||
  entries.some((entry, index) => entry.key !== expectedKeys[index])
) {
  throw new Error('Precipitation-rate guide entries are missing, duplicated, or out of order.');
}

export function getPrecipitationRateGuide(): PrecipitationRateGuideEntry[] {
  return entries.map((entry) => ({ ...entry }));
}
