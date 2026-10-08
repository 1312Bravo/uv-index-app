import type { Place, SelectedLocation } from '../../domain/location/locationTypes';
import { getLocationCoordinates } from '../../domain/location/getLocationCoordinates';

export function formatPlaceName(place: Place): string {
  const parts = [place.name];
  if (place.admin1 && place.admin1 !== place.name) parts.push(place.admin1);
  parts.push(place.country);
  return parts.join(', ');
}

export function getLocationName(location: SelectedLocation): string {
  if (location.source === 'device') return location.placeName ?? 'Current location';
  if (location.source === 'map') return location.placeName ?? 'Selected map location';
  return formatPlaceName(location.place);
}

export function formatLocationCoordinates(location: SelectedLocation): string {
  const { latitude, longitude } = getLocationCoordinates(location);
  return `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
}
