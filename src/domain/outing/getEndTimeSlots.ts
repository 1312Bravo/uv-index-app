import { createDateInTimeZone, getZonedDateTimeParts } from '../time/zonedDateTime';

const HALF_HOUR_MS = 30 * 60 * 1000;

function localMidnight(year: number, month: number, day: number, timeZone: string): Date {
  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  return createDateInTimeZone({
    year: calendarDate.getUTCFullYear(),
    month: calendarDate.getUTCMonth() + 1,
    day: calendarDate.getUTCDate(),
    hour: 0,
    minute: 0,
  }, timeZone);
}

export function getEndTimeSlots(now: Date, start: Date, timeZone: string): Date[] {
  const localToday = getZonedDateTimeParts(now, timeZone);
  const firstTime = localMidnight(localToday.year, localToday.month, localToday.day, timeZone).getTime();
  const lastTime = localMidnight(localToday.year, localToday.month, localToday.day + 2, timeZone).getTime();
  const earliestAllowed = Math.max(now.getTime(), start.getTime());
  const slots: Date[] = [];

  for (let time = firstTime; time < lastTime; time += HALF_HOUR_MS) {
    if (time > earliestAllowed) slots.push(new Date(time));
  }

  return slots;
}
