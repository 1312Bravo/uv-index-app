import type { LocationCoordinates } from '../../domain/location/locationTypes';

export type LocationForecastMetadata = {
  timeZone: string;
  forecastPoint: LocationCoordinates | null;
};

export async function getLocationTimeZone(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<LocationForecastMetadata> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m',
    timezone: 'auto',
    forecast_days: '1',
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
  if (!response.ok) throw new Error('The location time zone is unavailable.');

  const data = await response.json();
  if (typeof data?.timezone !== 'string' || !data.timezone) {
    throw new Error('The location time zone is unavailable.');
  }

  // Check that the returned zone can be used for local date and time formatting.
  new Intl.DateTimeFormat('en', { timeZone: data.timezone });
  const forecastPoint = typeof data.latitude === 'number' && Number.isFinite(data.latitude) &&
    data.latitude >= -90 && data.latitude <= 90 &&
    typeof data.longitude === 'number' && Number.isFinite(data.longitude) &&
    data.longitude >= -180 && data.longitude <= 180
    ? { latitude: data.latitude, longitude: data.longitude }
    : null;

  return { timeZone: data.timezone, forecastPoint };
}
