import type { DaylightEvents } from './daylightTypes';

const DEGREES_TO_RADIANS = Math.PI / 180;
const DAYS_PER_MILLISECOND = 86_400_000;
const JULIAN_UNIX_EPOCH = 2_440_587.5;
const JULIAN_2000_EPOCH = 2_451_545;
const APPROXIMATE_TRANSIT = 0.0009;
const SUNRISE_SUNSET_ALTITUDE = -0.833;
const CIVIL_TWILIGHT_ALTITUDE = -6;

function toJulianDay(date: Date): number {
  return date.getTime() / DAYS_PER_MILLISECOND + JULIAN_UNIX_EPOCH;
}

function toDaysSinceJ2000(date: Date): number {
  return toJulianDay(date) - JULIAN_2000_EPOCH;
}

function getSolarMeanAnomaly(day: number): number {
  return DEGREES_TO_RADIANS * (357.5291 + 0.98560028 * day);
}

function getEclipticLongitude(meanAnomaly: number): number {
  const correction = DEGREES_TO_RADIANS * (
    1.9148 * Math.sin(meanAnomaly) +
    0.02 * Math.sin(2 * meanAnomaly) +
    0.0003 * Math.sin(3 * meanAnomaly)
  );
  return meanAnomaly + correction + DEGREES_TO_RADIANS * 102.9372 + Math.PI;
}

function getSolarDeclination(eclipticLongitude: number): number {
  const obliquity = DEGREES_TO_RADIANS * 23.4397;
  return Math.asin(Math.sin(eclipticLongitude) * Math.sin(obliquity));
}

function getSolarTransit(day: number, meanAnomaly: number, eclipticLongitude: number): number {
  return JULIAN_2000_EPOCH + day +
    0.0053 * Math.sin(meanAnomaly) -
    0.0069 * Math.sin(2 * eclipticLongitude);
}

function getHourAngle(altitude: number, latitude: number, declination: number): number | null {
  const numerator = Math.sin(altitude) - Math.sin(latitude) * Math.sin(declination);
  const denominator = Math.cos(latitude) * Math.cos(declination);
  const cosine = numerator / denominator;

  if (cosine < -1 || cosine > 1) return null;
  return Math.acos(cosine);
}

function getEventTime(transit: number, hourAngle: number, isMorning: boolean): number {
  const julianTime = transit + (isMorning ? -1 : 1) * hourAngle / (2 * Math.PI);
  return (julianTime - JULIAN_UNIX_EPOCH) * 86_400;
}

function getPair(
  transit: number,
  altitude: number,
  latitude: number,
  declination: number,
): [number | null, number | null] {
  const hourAngle = getHourAngle(altitude * DEGREES_TO_RADIANS, latitude, declination);
  if (hourAngle === null) return [null, null];
  return [
    getEventTime(transit, hourAngle, true),
    getEventTime(transit, hourAngle, false),
  ];
}

/** Calculate local-date solar events as Unix seconds; missing polar events are null. */
export function getDaylightEvents(
  date: string,
  latitude: number,
  longitude: number,
): DaylightEvents {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new RangeError('Date must use YYYY-MM-DD format.');
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new RangeError('Coordinates are outside valid latitude and longitude ranges.');
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const dayOfMonth = Number(dayText);
  const localNoon = new Date(Date.UTC(year, month - 1, dayOfMonth, 12));
  if (
    localNoon.getUTCFullYear() !== year ||
    localNoon.getUTCMonth() !== month - 1 ||
    localNoon.getUTCDate() !== dayOfMonth
  ) {
    throw new RangeError('Date is not a valid calendar date.');
  }

  const daysSinceEpoch = toDaysSinceJ2000(localNoon);
  const longitudeWest = -longitude * DEGREES_TO_RADIANS;
  const cycle = Math.round(daysSinceEpoch - APPROXIMATE_TRANSIT - longitudeWest / (2 * Math.PI));
  const transitDay = APPROXIMATE_TRANSIT + longitudeWest / (2 * Math.PI) + cycle;
  const meanAnomaly = getSolarMeanAnomaly(transitDay);
  const eclipticLongitude = getEclipticLongitude(meanAnomaly);
  const declination = getSolarDeclination(eclipticLongitude);
  const transit = getSolarTransit(transitDay, meanAnomaly, eclipticLongitude);
  const latitudeRadians = latitude * DEGREES_TO_RADIANS;
  const [sunrise, sunset] = getPair(transit, SUNRISE_SUNSET_ALTITUDE, latitudeRadians, declination);
  const [civilDawn, civilDusk] = getPair(transit, CIVIL_TWILIGHT_ALTITUDE, latitudeRadians, declination);

  return { date, civilDawn, sunrise, sunset, civilDusk };
}

export function getLocalDateKey(timestamp: number, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: '2-digit',
    timeZone: timezone,
    year: 'numeric',
  }).formatToParts(new Date(timestamp * 1000));
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}
