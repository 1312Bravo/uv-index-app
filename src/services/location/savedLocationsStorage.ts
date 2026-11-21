import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Place, SelectedLocation } from '../../domain/location/locationTypes';

const SAVED_LOCATIONS_KEY = 'uv-scout:saved-locations:v1';

function isPlace(value: unknown): value is Place {
  if (!value || typeof value !== 'object') return false;
  const place = value as Partial<Place>;
  return Number.isFinite(place.id)
    && typeof place.name === 'string'
    && typeof place.country === 'string'
    && Number.isFinite(place.latitude)
    && Number.isFinite(place.longitude);
}

function isSelectedLocation(value: unknown): value is SelectedLocation {
  if (!value || typeof value !== 'object') return false;
  const location = value as Partial<SelectedLocation>;

  if (location.source === 'place') return isPlace(location.place);
  if (location.source !== 'device' && location.source !== 'map') return false;
  return Number.isFinite(location.latitude) && Number.isFinite(location.longitude);
}

export async function getSavedLocations(): Promise<SelectedLocation[]> {
  try {
    const stored = await AsyncStorage.getItem(SAVED_LOCATIONS_KEY);
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isSelectedLocation) : [];
  } catch {
    return [];
  }
}

export async function storeSavedLocations(locations: SelectedLocation[]): Promise<void> {
  await AsyncStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(locations));
}
