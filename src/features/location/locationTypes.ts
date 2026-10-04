import { formatPlaceName, type Place } from './searchPlaces';

export type SelectedLocation =
  | { source: 'device'; latitude: number; longitude: number; placeName?: string }
  | { source: 'place'; place: Place };

export function getLocationName(location: SelectedLocation): string {
  if (location.source === 'device') return location.placeName ?? 'Current location';
  return formatPlaceName(location.place);
}

export function formatLocationCoordinates(location: SelectedLocation): string {
  const latitude = location.source === 'device' ? location.latitude : location.place.latitude;
  const longitude = location.source === 'device' ? location.longitude : location.place.longitude;
  return `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
}
