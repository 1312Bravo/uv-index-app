import { getLocalDateKey } from '../../domain/daylight/getDaylightEvents';
import type { ForecastHour } from '../../domain/forecast/forecastTypes';
import { getUvForecastAtTime } from '../../domain/forecast/getUvForecastAtTime';

export type OutlookTimeSlot = {
  time: number;
};

export function getOutlookTimeSlots(
  hours: ForecastHour[],
  timezone: string,
  afterTime: number,
): OutlookTimeSlot[] {
  return hours
    .filter((hour) => hour.period !== 'past')
    .flatMap((hour) => [0, 1800]
      .map((offset) => ({ time: hour.time + offset }))
      .filter((slot) => slot.time * 1000 > afterTime &&
        getLocalDateKey(slot.time, timezone) === getLocalDateKey(hour.time, timezone) &&
        getUvForecastAtTime(hours, slot.time) !== null),
    );
}

export function getForecastHourForTime(hours: ForecastHour[], time: number): ForecastHour | undefined {
  return hours.find((hour) => time >= hour.time && time < hour.time + 3600);
}
