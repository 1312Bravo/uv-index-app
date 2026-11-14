import type { HourlyAirQualityValue } from './airQualityTypes';

export type OutingAirQualitySummary = {
  lowestAqi: number;
  peakAqi: number;
  averageAqi: number;
  coverageFraction: number;
};

function getHourOverlap(
  hour: HourlyAirQualityValue,
  startSeconds: number,
  endSeconds: number,
): number {
  return Math.max(0, Math.min(hour.time + 3600, endSeconds) - Math.max(hour.time, startSeconds));
}

export function summarizeOutingAirQuality(
  hours: HourlyAirQualityValue[],
  start: Date,
  end: Date,
): OutingAirQualitySummary | null {
  const startSeconds = start.getTime() / 1000;
  const endSeconds = end.getTime() / 1000;
  const requestedSeconds = endSeconds - startSeconds;
  if (!Number.isFinite(requestedSeconds) || requestedSeconds <= 0) return null;

  const coveredValues = hours.flatMap((hour) => {
    const overlapSeconds = getHourOverlap(hour, startSeconds, endSeconds);
    return hour.europeanAqi !== null && overlapSeconds > 0
      ? [{ value: hour.europeanAqi, overlapSeconds }]
      : [];
  });
  if (coveredValues.length === 0) return null;

  const coveredSeconds = coveredValues.reduce((total, item) => total + item.overlapSeconds, 0);
  const values = coveredValues.map(({ value }) => value);
  const peakAqi = Math.max(...coveredValues.map(({ value }) => value));
  const lowestAqi = Math.min(...values);
  const averageAqi = coveredValues.reduce(
    (total, item) => total + item.value * item.overlapSeconds,
    0,
  ) / coveredSeconds;

  return {
    lowestAqi,
    peakAqi,
    averageAqi,
    coverageFraction: Math.min(1, coveredSeconds / requestedSeconds),
  };
}
