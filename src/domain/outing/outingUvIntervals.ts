import type { HourlyForecast } from '../forecast/forecastTypes';

export type OutingUvInterval = {
  /** Start of the preceding hour represented by the provider's UV mean. */
  time: number;
  sourceTime: number;
  uv: number;
  cloudCover: number | null;
};

// Hourly UV is a preceding-hour mean. Keep its source timestamp separately
// from its interval start, and never replace it with the Now UV estimate.
export function getOutingUvIntervals(
  forecast: HourlyForecast,
  startSeconds: number,
  endSeconds: number,
): OutingUvInterval[] {
  const weatherAt = new Map(forecast.hours.map((hour) => [hour.time, hour]));
  return forecast.hours.flatMap((hour) => {
    const time = hour.time - 3600;
    if (time >= endSeconds || hour.time <= startSeconds) return [];
    return [{
      time,
      sourceTime: hour.time,
      uv: hour.hourlyUv ?? hour.uv,
      // Cloud cover keeps its forward-hour interpretation; join it by interval.
      cloudCover: weatherAt.get(time)?.cloudCover ?? null,
    }];
  }).sort((left, right) => left.time - right.time);
}
