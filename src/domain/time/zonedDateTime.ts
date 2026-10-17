export type ZonedDateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

const partsFormatterOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
};

export function getZonedDateTimeParts(value: Date, timeZone: string): ZonedDateTimeParts {
  const parts = new Intl.DateTimeFormat('en-US-u-ca-gregory-nu-latn', {
    ...partsFormatterOptions,
    timeZone,
  }).formatToParts(value);
  const getPart = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);

  return {
    year: getPart('year'),
    month: getPart('month'),
    day: getPart('day'),
    hour: getPart('hour'),
    minute: getPart('minute'),
  };
}

function sameParts(left: ZonedDateTimeParts, right: ZonedDateTimeParts): boolean {
  return left.year === right.year && left.month === right.month && left.day === right.day &&
    left.hour === right.hour && left.minute === right.minute;
}

function compareParts(left: ZonedDateTimeParts, right: ZonedDateTimeParts): number {
  return Date.UTC(left.year, left.month - 1, left.day, left.hour, left.minute) -
    Date.UTC(right.year, right.month - 1, right.day, right.hour, right.minute);
}

function getOffsetAt(value: Date, timeZone: string): number {
  const parts = getZonedDateTimeParts(value, timeZone);
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute) - value.getTime();
}

export function createDateInTimeZone(parts: ZonedDateTimeParts, timeZone: string): Date {
  const wallClockAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  const offsets = new Set<number>();

  for (const hours of [-36, -24, -12, 0, 12, 24, 36]) {
    offsets.add(getOffsetAt(new Date(wallClockAsUtc + hours * 60 * 60 * 1000), timeZone));
  }

  const candidates = [...offsets]
    .map((offset) => new Date(wallClockAsUtc - offset))
    .sort((left, right) => left.getTime() - right.getTime());
  const exactMatch = candidates.find((candidate) => sameParts(getZonedDateTimeParts(candidate, timeZone), parts));
  if (exactMatch) return exactMatch;

  // A wall time in a spring-forward gap does not exist. Match standard
  // time-zone compatible behavior by moving forward to the first valid time.
  const afterGap = candidates
    .map((candidate) => ({ candidate, difference: compareParts(getZonedDateTimeParts(candidate, timeZone), parts) }))
    .filter(({ difference }) => difference > 0)
    .sort((left, right) => left.difference - right.difference || left.candidate.getTime() - right.candidate.getTime())[0];

  if (afterGap) return afterGap.candidate;
  throw new RangeError('Could not resolve this local time in ' + timeZone + '.');
}

export function convertInstantPreservingLocalTime(value: Date, fromTimeZone: string, toTimeZone: string): Date {
  return createDateInTimeZone(getZonedDateTimeParts(value, fromTimeZone), toTimeZone);
}

export function getNextHourInTimeZone(now: Date, timeZone: string): Date {
  const localParts = getZonedDateTimeParts(now, timeZone);
  const nextWallHour = new Date(Date.UTC(localParts.year, localParts.month - 1, localParts.day, localParts.hour + 1));
  return createDateInTimeZone({
    year: nextWallHour.getUTCFullYear(),
    month: nextWallHour.getUTCMonth() + 1,
    day: nextWallHour.getUTCDate(),
    hour: nextWallHour.getUTCHours(),
    minute: 0,
  }, timeZone);
}
