import type { DaylightEvents } from '../daylight/daylightTypes';

export type ForecastHour = {
  time: number;
  uv: number;
  hourlyUv?: number;
  temperature: number;
  cloudCover: number | null;
  hourlyCloudCover?: number | null;
  precipitationProbability: number | null;
  precipitation: number | null;
  windSpeed: number | null;
  /** Maximum gust for the hour ending at time, in km/h. */
  windGust: number | null;
  period: 'past' | 'now' | 'future';
};

export type HourlyForecast = {
  timezone: string;
  currentConditionsTime: number | null;
  currentPrecipitation: number | null;
  currentPrecipitationInterval: number | null;
  currentPrecipitationTime: number | null;
  hours: ForecastHour[];
  daylight: DaylightEvents[];
};
