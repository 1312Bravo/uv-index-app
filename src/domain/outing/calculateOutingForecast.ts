import type { ForecastHour, HourlyForecast } from '../forecast/forecastTypes';
import { getUvCategory, type UvCategoryInfo } from '../uv/getUvCategory';

export type OutingForecastSummary = {
  hours: ForecastHour[];
  highestUv: number;
  highestUvTime: number;
  averageUv: number;
  highestCategory: UvCategoryInfo;
  averageTemperature: number;
  lowestTemperature: number;
  highestTemperature: number;
  averageCloudCover: number | null;
  lowestCloudCover: number | null;
  highestCloudCover: number | null;
  expectedPrecipitationMm: number | null;
  peakHourlyPrecipitationProbability: number | null;
  completePrecipitationHours: number;
  startSeconds: number;
  endSeconds: number;
  requestedSeconds: number;
  coveredSeconds: number;
  coverageFraction: number;
  missingIntervals: Array<{ start: number; end: number }>;
};

export function getHourOverlap(
  hour: ForecastHour,
  startSeconds: number,
  endSeconds: number,
): { start: number; end: number; seconds: number } | null {
  const start = Math.max(hour.time, startSeconds);
  const end = Math.min(hour.time + 3600, endSeconds);
  return end > start ? { start, end, seconds: end - start } : null;
}

function getPrecipitationHourOverlap(
  hour: ForecastHour,
  startSeconds: number,
  endSeconds: number,
): { start: number; end: number; seconds: number } | null {
  const start = Math.max(hour.time - 3600, startSeconds);
  const end = Math.min(hour.time, endSeconds);
  return end > start ? { start, end, seconds: end - start } : null;
}

export function selectOutingHours(forecast: HourlyForecast, start: Date, end: Date): ForecastHour[] {
  const startSeconds = start.getTime() / 1000;
  const endSeconds = end.getTime() / 1000;

  return forecast.hours.filter((hour) => getHourOverlap(hour, startSeconds, endSeconds) !== null);
}

export function summarizeOutingForecast(
  forecast: HourlyForecast,
  start: Date,
  end: Date,
): OutingForecastSummary | null {
  const hours = selectOutingHours(forecast, start, end);
  if (hours.length === 0) return null;

  const highestUv = Math.max(...hours.map((hour) => hour.uv));
  const highestUvTime = hours.find((hour) => hour.uv === highestUv)!.time;
  const temperatures = hours.map((hour) => hour.temperature);
  const startSeconds = start.getTime() / 1000;
  const endSeconds = end.getTime() / 1000;
  const requestedSeconds = endSeconds - startSeconds;
  if (!Number.isFinite(requestedSeconds) || requestedSeconds <= 0) return null;
  const intervals = hours
    .map((hour) => getHourOverlap(hour, startSeconds, endSeconds))
    .filter((interval): interval is NonNullable<typeof interval> => interval !== null)
    .sort((left, right) => left.start - right.start);
  const mergedIntervals: Array<{ start: number; end: number }> = [];
  for (const interval of intervals) {
    const previous = mergedIntervals.at(-1);
    if (previous && interval.start <= previous.end) {
      previous.end = Math.max(previous.end, interval.end);
    } else {
      mergedIntervals.push({ start: interval.start, end: interval.end });
    }
  }
  const coveredSeconds = mergedIntervals.reduce((total, interval) => total + interval.end - interval.start, 0);
  const missingIntervals: Array<{ start: number; end: number }> = [];
  let cursor = startSeconds;
  for (const interval of mergedIntervals) {
    if (interval.start > cursor) missingIntervals.push({ start: cursor, end: interval.start });
    cursor = Math.max(cursor, interval.end);
  }
  if (cursor < endSeconds) missingIntervals.push({ start: cursor, end: endSeconds });
  const getWeightedAverage = (valueFor: (hour: ForecastHour) => number) =>
    hours.reduce((total, hour) =>
      total + valueFor(hour) * (getHourOverlap(hour, startSeconds, endSeconds)?.seconds ?? 0), 0,
    ) / coveredSeconds;
  const cloudCoverHours = hours.filter((hour) => hour.cloudCover !== null);
  const cloudCoverCoveredSeconds = cloudCoverHours.reduce((total, hour) =>
    total + (getHourOverlap(hour, startSeconds, endSeconds)?.seconds ?? 0), 0,
  );
  const averageCloudCover = cloudCoverCoveredSeconds > 0
    ? cloudCoverHours.reduce((total, hour) =>
      total + hour.cloudCover! * (getHourOverlap(hour, startSeconds, endSeconds)?.seconds ?? 0), 0,
    ) / cloudCoverCoveredSeconds
    : null;
  const cloudCoverValues = cloudCoverHours.map((hour) => hour.cloudCover!);

  const precipitationIntervals = forecast.hours
    .map((hour) => ({
      hour,
      overlap: getPrecipitationHourOverlap(hour, startSeconds, endSeconds),
    }))
    .filter((entry): entry is { hour: ForecastHour; overlap: NonNullable<typeof entry.overlap> } =>
      entry.overlap !== null,
    );
  const completePrecipitationHours = precipitationIntervals.filter(({ hour }) =>
    hour.time - 3600 >= startSeconds && hour.time <= endSeconds,
  );
  const precipitationValues = completePrecipitationHours.map(({ hour }) => hour.precipitation);
  const expectedPrecipitationMm = precipitationValues.length > 0 &&
    precipitationValues.every((value): value is number => value !== null)
    ? precipitationValues.reduce((total, value) => total + value, 0)
    : null;
  const precipitationProbabilities = precipitationIntervals.flatMap(({ hour }) =>
    hour.precipitationProbability === null ? [] : [hour.precipitationProbability],
  );

  return {
    hours,
    highestUv,
    highestUvTime,
    averageUv: getWeightedAverage((hour) => hour.uv),
    highestCategory: getUvCategory(highestUv),
    averageTemperature: getWeightedAverage((hour) => hour.temperature),
    lowestTemperature: Math.min(...temperatures),
    highestTemperature: Math.max(...temperatures),
    averageCloudCover,
    lowestCloudCover: cloudCoverValues.length > 0 ? Math.min(...cloudCoverValues) : null,
    highestCloudCover: cloudCoverValues.length > 0 ? Math.max(...cloudCoverValues) : null,
    expectedPrecipitationMm,
    peakHourlyPrecipitationProbability: precipitationProbabilities.length > 0
      ? Math.max(...precipitationProbabilities)
      : null,
    completePrecipitationHours: completePrecipitationHours.length,
    startSeconds,
    endSeconds,
    requestedSeconds,
    coveredSeconds,
    coverageFraction: coveredSeconds / requestedSeconds,
    missingIntervals,
  };
}
