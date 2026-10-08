import type { LocationCoordinates, SelectedLocation } from './locationTypes';

export function getLocationCoordinates(location: SelectedLocation): LocationCoordinates {
  if (location.source === 'place') {
    return { latitude: location.place.latitude, longitude: location.place.longitude };
  }

  return { latitude: location.latitude, longitude: location.longitude };
}
