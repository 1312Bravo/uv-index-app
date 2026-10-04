import type { ForecastHour, HourlyForecast } from '../forecast/forecastTypes';
import { getUvCategory, type UvCategoryInfo } from '../uv/uvCategories';

export type OutingForecastSummary = {
  hours: ForecastHour[];
  highestUv: number;
  highestCategory: UvCategoryInfo;
  lowestTemperature: number;
  highestTemperature: number;
};

export function selectOutingHours(forecast: HourlyForecast, start: Date, end: Date): ForecastHour[] {
  const startSeconds = start.getTime() / 1000;
  const endSeconds = end.getTime() / 1000;

  return forecast.hours.filter((hour) => hour.time < endSeconds && hour.time + 3600 > startSeconds);
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

  return {
    hours,
    highestUv,
    highestCategory: getUvCategory(highestUv),
    lowestTemperature: Math.min(...temperatures),
    highestTemperature: Math.max(...temperatures),
  };
}
