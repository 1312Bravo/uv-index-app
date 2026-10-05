import type { ForecastHour, HourlyForecast } from '../forecast/forecastTypes';
import { getUvCategory, type UvCategoryInfo } from '../uv/getUvCategory';

export type OutingForecastSummary = {
  hours: ForecastHour[];
  highestUv: number;
  averageUv: number;
  highestCategory: UvCategoryInfo;
  averageTemperature: number;
  lowestTemperature: number;
  highestTemperature: number;
};

function getOverlappingSeconds(hour: ForecastHour, startSeconds: number, endSeconds: number): number {
  return Math.max(0, Math.min(hour.time + 3600, endSeconds) - Math.max(hour.time, startSeconds));
}

export function selectOutingHours(forecast: HourlyForecast, start: Date, end: Date): ForecastHour[] {
  const startSeconds = start.getTime() / 1000;
  const endSeconds = end.getTime() / 1000;

  return forecast.hours.filter((hour) => getOverlappingSeconds(hour, startSeconds, endSeconds) > 0);
}

export function summarizeOutingForecast(
  forecast: HourlyForecast,
  start: Date,
  end: Date,
): OutingForecastSummary | null {
  const hours = selectOutingHours(forecast, start, end);
  if (hours.length === 0) return null;

  const highestUv = Math.max(...hours.map((hour) => hour.uv));
  const temperatures = hours.map((hour) => hour.temperature);
  const startSeconds = start.getTime() / 1000;
  const endSeconds = end.getTime() / 1000;
  const totalSeconds = hours.reduce(
    (total, hour) => total + getOverlappingSeconds(hour, startSeconds, endSeconds),
    0,
  );
  const getWeightedAverage = (valueFor: (hour: ForecastHour) => number) =>
    hours.reduce((total, hour) =>
      total + valueFor(hour) * getOverlappingSeconds(hour, startSeconds, endSeconds), 0,
    ) / totalSeconds;

  return {
    hours,
    highestUv,
    averageUv: getWeightedAverage((hour) => hour.uv),
    highestCategory: getUvCategory(highestUv),
    averageTemperature: getWeightedAverage((hour) => hour.temperature),
    lowestTemperature: Math.min(...temperatures),
    highestTemperature: Math.max(...temperatures),
  };
}
