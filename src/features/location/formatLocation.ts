import type { Place, SelectedLocation } from '../../domain/location/locationTypes';

export function formatPlaceName(place: Place): string {
  const parts = [place.name];
  if (place.admin1 && place.admin1 !== place.name) parts.push(place.admin1);
  parts.push(place.country);
  return parts.join(', ');
}

export function getLocationName(location: SelectedLocation): string {
  if (location.source === 'device') return location.placeName ?? 'Current location';
  return formatPlaceName(location.place);
}

export function formatLocationCoordinates(location: SelectedLocation): string {
  const latitude = location.source === 'device' ? location.latitude : location.place.latitude;
  const longitude = location.source === 'device' ? location.longitude : location.place.longitude;
  return `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
}
