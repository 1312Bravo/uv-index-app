import type { ForecastHour } from './forecastTypes';

export type UvForecastAtTime = {
  uv: number;
  interpolated: boolean;
};

// Custom-time smoothing between adjacent hourly means is a product approximation,
// not a provider-issued instantaneous UV forecast. The outing calculation uses
// the source's preceding-hour intervals instead; see notes/uv-hourly-timing-review.md.
export function getUvForecastAtTime(hours: ForecastHour[], time: number): UvForecastAtTime | null {
  const index = hours.findIndex((hour) => time >= hour.time && time < hour.time + 3600);
  if (index < 0) return null;

  const hour = hours[index];
  const uv = hour.hourlyUv ?? hour.uv;
  if (time === hour.time) return { uv, interpolated: false };

  const nextHour = hours[index + 1];
  if (!nextHour || nextHour.time !== hour.time + 3600) return null;

  const nextUv = nextHour.hourlyUv ?? nextHour.uv;
  const fraction = (time - hour.time) / 3600;
  return { uv: uv + (nextUv - uv) * fraction, interpolated: true };
}
