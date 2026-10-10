import type { DaylightEvents } from '../daylight/daylightTypes';

export type ForecastHour = {
  time: number;
  uv: number;
  temperature: number;
  cloudCover: number | null;
  precipitationProbability: number | null;
  precipitation: number | null;
  windSpeed: number | null;
  period: 'past' | 'now' | 'future';
};

export type HourlyForecast = {
  timezone: string;
  hours: ForecastHour[];
  daylight: DaylightEvents[];
};
