import { createDateInTimeZone, getZonedDateTimeParts } from '../time/zonedDateTime';

const HALF_HOUR_MS = 30 * 60 * 1000;

// Open-Meteo returns two local forecast days, ending with the 11 PM hourly value.
export function getForecastEndTime(now: Date, timeZone: string): Date {
  const today = getZonedDateTimeParts(now, timeZone);
  const tomorrow = new Date(Date.UTC(today.year, today.month - 1, today.day + 1));

  return createDateInTimeZone({
    year: tomorrow.getUTCFullYear(),
    month: tomorrow.getUTCMonth() + 1,
    day: tomorrow.getUTCDate(),
    hour: 23,
    minute: 0,
  }, timeZone);
}

// Offer only half-hour durations whose end remains inside the requested forecast window.
export function getDurationOptions(start: Date, forecastEnd: Date): number[] {
  const availableMinutes = Math.floor((forecastEnd.getTime() - start.getTime()) / 60_000);
  const maximumDuration = Math.floor(availableMinutes / 30) * 30;

  return Array.from(
    { length: Math.max(0, maximumDuration / 30) },
    (_, index) => (index + 1) * 30,
  );
}
