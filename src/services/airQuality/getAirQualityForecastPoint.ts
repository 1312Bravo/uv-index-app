import type { LocationCoordinates } from '../../domain/location/locationTypes';

export function getAirQualityForecastPoint(data: {
  latitude?: unknown;
  longitude?: unknown;
}): LocationCoordinates | null {
  const { latitude, longitude } = data;
  return typeof latitude === 'number' && Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 &&
    typeof longitude === 'number' && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180
    ? { latitude, longitude }
    : null;
}
