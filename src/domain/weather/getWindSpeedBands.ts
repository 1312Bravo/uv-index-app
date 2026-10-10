import definitions from './windSpeedBands.json';

export type WindSpeedBand = {
  key: string;
  minimumKmhInclusive: number;
  maximumKmhInclusive: number | null;
  label: string;
  description: string;
  range: string;
};

const bands: WindSpeedBand[] = definitions.map((definition, index) => {
  const { key, minimumKmhInclusive, maximumKmhInclusive, label, description } = definition;
  const previous = definitions[index - 1];
  const expectedMinimum = previous ? (previous.maximumKmhInclusive ?? -1) + 1 : 0;
  const isLast = index === definitions.length - 1;

  if (
    !key.trim() || !label.trim() || !description.trim() ||
    !Number.isInteger(minimumKmhInclusive) || minimumKmhInclusive !== expectedMinimum ||
    (maximumKmhInclusive !== null &&
      (!Number.isInteger(maximumKmhInclusive) || maximumKmhInclusive < minimumKmhInclusive)) ||
    (isLast ? maximumKmhInclusive !== null : maximumKmhInclusive === null) ||
    definitions.slice(0, index).some((candidate) => candidate.key === key)
  ) {
    throw new Error(`Invalid wind-speed band definition at row ${index + 1}.`);
  }

  return {
    key,
    minimumKmhInclusive,
    maximumKmhInclusive,
    label,
    description,
    range: maximumKmhInclusive === null
      ? `${minimumKmhInclusive}+ km/h`
      : `${minimumKmhInclusive}–${maximumKmhInclusive} km/h`,
  };
});

if (bands.length === 0 || bands[0].minimumKmhInclusive !== 0) {
  throw new Error('Wind-speed bands must begin at 0 km/h and cover all higher values.');
}

export function getWindSpeedBands(): WindSpeedBand[] {
  return bands.map((band) => ({ ...band }));
}
