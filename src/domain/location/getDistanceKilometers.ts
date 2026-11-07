import type { LocationCoordinates } from './locationTypes';

const EARTH_RADIUS_KILOMETERS = 6371.0088;

function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

// Great-circle distance between the selected coordinates and the forecast grid-cell center.
export function getDistanceKilometers(from: LocationCoordinates, to: LocationCoordinates): number {
  const latitudeDifference = toRadians(to.latitude - from.latitude);
  const longitudeDifference = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);
  const haversine = Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDifference / 2) ** 2;

  return 2 * EARTH_RADIUS_KILOMETERS * Math.asin(Math.sqrt(Math.min(1, haversine)));
}
