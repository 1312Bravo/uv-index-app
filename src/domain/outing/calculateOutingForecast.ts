import type { ForecastHour, HourlyForecast } from '../forecast/forecastTypes';
import { getUvCategory, type UvCategoryInfo } from '../uv/getUvCategory';
import { getOutingUvIntervals, type OutingUvInterval } from './outingUvIntervals';

export type OutingForecastSummary = {
  hours: OutingUvInterval[];
  highestUv: number;
  highestUvTime: number;
  averageUv: number;
  highestCategory: UvCategoryInfo;
  averageTemperature: number | null;
  lowestTemperature: number | null;
  highestTemperature: number | null;
  averageCloudCover: number | null;
  lowestCloudCover: number | null;
  highestCloudCover: number | null;
  averageWindSpeed: number | null;
  lowestWindSpeed: number | null;
  highestWindSpeed: number | null;
  averageHourlyGustPeak: number | null;
  lowestHourlyGustPeak: number | null;
  highestHourlyGustPeak: number | null;
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
  hour: { time: number },
  startSeconds: number,
  endSeconds: number,
): { start: number; end: number; seconds: number } | null {
  const start = Math.max(hour.time, startSeconds);
  const end = Math.min(hour.time + 3600, endSeconds);
  return end > start ? { start, end, seconds: end - start } : null;
}

function getPrecedingHourOverlap(
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
  const startSeconds = start.getTime() / 1000;
  const endSeconds = end.getTime() / 1000;
  const requestedSeconds = endSeconds - startSeconds;
  if (!Number.isFinite(requestedSeconds) || requestedSeconds <= 0) return null;
  const hours = getOutingUvIntervals(forecast, startSeconds, endSeconds);
  if (hours.length === 0) return null;
  const weatherHours = selectOutingHours(forecast, start, end);
  const highestUv = Math.max(...hours.map((hour) => hour.uv));
  const highestUvTime = Math.max(startSeconds, hours.find((hour) => hour.uv === highestUv)!.time);
  const temperatures = weatherHours.map((hour) => hour.temperature);
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
  const averageUv = hours.reduce((total, hour) =>
    total + hour.uv * (getHourOverlap(hour, startSeconds, endSeconds)?.seconds ?? 0), 0,
  ) / coveredSeconds;
  const weatherCoveredSeconds = weatherHours.reduce((total, hour) =>
    total + (getHourOverlap(hour, startSeconds, endSeconds)?.seconds ?? 0), 0,
  );
  const getWeightedWeatherAverage = (valueFor: (hour: ForecastHour) => number) =>
    weatherCoveredSeconds > 0 ? weatherHours.reduce((total, hour) =>
      total + valueFor(hour) * (getHourOverlap(hour, startSeconds, endSeconds)?.seconds ?? 0), 0,
    ) / weatherCoveredSeconds : null;
  const cloudCoverHours = weatherHours.filter((hour) => hour.cloudCover !== null);
  const cloudCoverCoveredSeconds = cloudCoverHours.reduce((total, hour) =>
    total + (getHourOverlap(hour, startSeconds, endSeconds)?.seconds ?? 0), 0,
  );
  const averageCloudCover = cloudCoverCoveredSeconds > 0
    ? cloudCoverHours.reduce((total, hour) =>
      total + hour.cloudCover! * (getHourOverlap(hour, startSeconds, endSeconds)?.seconds ?? 0), 0,
    ) / cloudCoverCoveredSeconds
    : null;
  const cloudCoverValues = cloudCoverHours.map((hour) => hour.cloudCover!);
  // Missing wind readings contribute neither a value nor time to the average.
  const windHours = weatherHours.filter((hour) => hour.windSpeed !== null);
  const windCoveredSeconds = windHours.reduce((total, hour) =>
    total + (getHourOverlap(hour, startSeconds, endSeconds)?.seconds ?? 0), 0,
  );
  const averageWindSpeed = windCoveredSeconds > 0
    ? windHours.reduce((total, hour) =>
      total + hour.windSpeed! * (getHourOverlap(hour, startSeconds, endSeconds)?.seconds ?? 0), 0,
    ) / windCoveredSeconds
    : null;
  const windValues = windHours.map((hour) => hour.windSpeed!);

  const precedingHourIntervals = forecast.hours
    .map((hour) => ({
      hour,
      overlap: getPrecedingHourOverlap(hour, startSeconds, endSeconds),
    }))
    .filter((entry): entry is { hour: ForecastHour; overlap: NonNullable<typeof entry.overlap> } =>
      entry.overlap !== null,
    );
  const gustIntervals = precedingHourIntervals.filter(({ hour }) =>
    typeof hour.windGust === 'number' && Number.isFinite(hour.windGust) && hour.windGust >= 0,
  );
  const gustCoveredSeconds = gustIntervals.reduce((total, { overlap }) => total + overlap.seconds, 0);
  // Average hourly maxima by their covered duration; this is not the single
  // strongest gust and does not locate a gust inside a partial hour.
  const averageHourlyGustPeak = gustCoveredSeconds > 0
    ? gustIntervals.reduce((total, { hour, overlap }) => total + hour.windGust! * overlap.seconds, 0) / gustCoveredSeconds
    : null;
  const gustPeaks = gustIntervals.map(({ hour }) => hour.windGust!);
  const completePrecipitationHours = precedingHourIntervals.filter(({ hour }) =>
    hour.time - 3600 >= startSeconds && hour.time <= endSeconds,
  );
  const precipitationValues = completePrecipitationHours.map(({ hour }) => hour.precipitation);
  const expectedPrecipitationMm = precipitationValues.length > 0 &&
    precipitationValues.every((value): value is number => value !== null)
    ? precipitationValues.reduce((total, value) => total + value, 0)
    : null;
  const precipitationProbabilities = precedingHourIntervals.flatMap(({ hour }) =>
    hour.precipitationProbability === null ? [] : [hour.precipitationProbability],
  );

  return {
    hours,
    highestUv,
    highestUvTime,
    averageUv,
    highestCategory: getUvCategory(highestUv),
    averageTemperature: getWeightedWeatherAverage((hour) => hour.temperature),
    lowestTemperature: temperatures.length > 0 ? Math.min(...temperatures) : null,
    highestTemperature: temperatures.length > 0 ? Math.max(...temperatures) : null,
    averageCloudCover,
    lowestCloudCover: cloudCoverValues.length > 0 ? Math.min(...cloudCoverValues) : null,
    highestCloudCover: cloudCoverValues.length > 0 ? Math.max(...cloudCoverValues) : null,
    averageWindSpeed,
    lowestWindSpeed: windValues.length > 0 ? Math.min(...windValues) : null,
    highestWindSpeed: windValues.length > 0 ? Math.max(...windValues) : null,
    averageHourlyGustPeak,
    lowestHourlyGustPeak: gustPeaks.length > 0 ? Math.min(...gustPeaks) : null,
    highestHourlyGustPeak: gustPeaks.length > 0 ? Math.max(...gustPeaks) : null,
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
