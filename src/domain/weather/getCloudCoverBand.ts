import definitions from './cloudCoverBands.json';

export type CloudCoverBand = {
  key: string;
  label: string;
  minimumPercentInclusive: number;
  maximumPercentInclusive: number;
  description: string;
};

const bands: CloudCoverBand[] = definitions.map((definition, index) => {
  const { key, label, minimumPercentInclusive, maximumPercentInclusive, description } = definition;
  const previous = definitions[index - 1];
  if (
    !key.trim() || !label.trim() || !description.trim() ||
    !Number.isInteger(minimumPercentInclusive) ||
    !Number.isInteger(maximumPercentInclusive) ||
    minimumPercentInclusive < 0 || maximumPercentInclusive > 100 ||
    minimumPercentInclusive > maximumPercentInclusive ||
    (index === 0 ? minimumPercentInclusive !== 0 : minimumPercentInclusive !== previous.maximumPercentInclusive + 1) ||
    definitions.slice(0, index).some((candidate) => candidate.key === key)
  ) {
    throw new Error(`Invalid cloud-cover band definition at row ${index + 1}.`);
  }
  return { key, label, minimumPercentInclusive, maximumPercentInclusive, description };
});

if (
  bands.length === 0 ||
  bands[bands.length - 1].maximumPercentInclusive !== 100
) {
  throw new Error('Cloud-cover bands must cover the full 0–100% range.');
}

export function getCloudCoverBands(): CloudCoverBand[] {
  return bands.map((band) => ({ ...band }));
}

export function getCloudCoverBand(percent: number): CloudCoverBand {
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    throw new Error('Cloud cover must be a percentage from 0 to 100.');
  }

  const roundedPercent = Math.round(percent);
  const band = bands.find((candidate) =>
    roundedPercent >= candidate.minimumPercentInclusive &&
    roundedPercent <= candidate.maximumPercentInclusive,
  );
  if (!band) throw new Error('No cloud-cover band matches this percentage.');
  return { ...band };
}
