import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SavedLocation } from '../../domain/location/savedLocationTypes';
import type { Place, SelectedLocation } from '../../domain/location/locationTypes';

const SAVED_LOCATIONS_KEY = 'uv-scout:saved-locations:v2';
const LEGACY_SAVED_LOCATIONS_KEY = 'uv-scout:saved-locations:v1';

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

function isSavedLocation(value: unknown): value is SavedLocation {
  if (!value || typeof value !== 'object') return false;
  const saved = value as Partial<SavedLocation>;
  return isSelectedLocation(saved.location) && typeof saved.name === 'string';
}

function parseSavedLocations(value: unknown): SavedLocation[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (isSavedLocation(entry)) return [entry];
    if (isSelectedLocation(entry)) return [{ location: entry, name: '' }];
    return [];
  });
}

export async function getSavedLocations(): Promise<SavedLocation[]> {
  try {
    const stored = await AsyncStorage.getItem(SAVED_LOCATIONS_KEY);
    if (stored) return parseSavedLocations(JSON.parse(stored));

    const legacyStored = await AsyncStorage.getItem(LEGACY_SAVED_LOCATIONS_KEY);
    if (!legacyStored) return [];
    return parseSavedLocations(JSON.parse(legacyStored));
  } catch {
    return [];
  }
}

export async function storeSavedLocations(locations: SavedLocation[]): Promise<void> {
  await AsyncStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(locations));
}
