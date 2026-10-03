export type Place = {
  id: number;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
};

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en`;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error('Place search is unavailable.');
  }

  const data: unknown = await response.json();
  if (!data || typeof data !== 'object' || !('results' in data)) {
    return [];
  }

  const results = data.results;
  if (!Array.isArray(results)) {
    return [];
  }

  return results.filter((item): item is Place => (
    item !== null &&
    typeof item === 'object' &&
    typeof item.id === 'number' &&
    typeof item.name === 'string' &&
    typeof item.country === 'string' &&
    typeof item.latitude === 'number' &&
    typeof item.longitude === 'number'
  ));
}

export function formatPlaceName(place: Place): string {
  const parts = [place.name];
  if (place.admin1 && place.admin1 !== place.name) {
    parts.push(place.admin1);
  }
  parts.push(place.country);
  return parts.join(', ');
}
