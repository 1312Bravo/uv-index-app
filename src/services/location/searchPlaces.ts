import type { Place } from '../../domain/location/locationTypes';

type GeocodingPlace = Place & { country_code?: string };

function readPlaces(data: unknown): GeocodingPlace[] {
  if (!data || typeof data !== 'object' || !('results' in data) || !Array.isArray(data.results)) {
    return [];
  }
  return data.results.filter((item): item is GeocodingPlace => (
    item !== null &&
    typeof item === 'object' &&
    typeof item.id === 'number' &&
    typeof item.name === 'string' &&
    typeof item.country === 'string' &&
    typeof item.latitude === 'number' &&
    typeof item.longitude === 'number'
  ));
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en`;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error('Place search is unavailable.');
  }

  const results = readPlaces(await response.json());
  if (!results.some((place) => place.country_code === 'SI')) return results;

  try {
    const localizedResponse = await fetch(url.replace('language=en', 'language=sl'), { signal });
    if (!localizedResponse.ok) return results;
    const localizedById = new Map(readPlaces(await localizedResponse.json())
      .map((place) => [place.id, place]));
    return results.map((place) => {
      const localized = place.country_code === 'SI' ? localizedById.get(place.id) : null;
      return localized ? { ...place, name: localized.name, admin1: localized.admin1 } : place;
    });
  } catch {
    return results;
  }
}
