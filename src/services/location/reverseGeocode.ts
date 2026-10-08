type ReverseGeocodeResponse = {
  city?: string;
  countryName?: string;
  locality?: string;
  principalSubdivision?: string;
};

function isReverseGeocodeResponse(value: unknown): value is ReverseGeocodeResponse {
  return value !== null && typeof value === 'object';
}

export async function reverseGeocodePlace(latitude: number, longitude: number, signal?: AbortSignal): Promise<string | null> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    localityLanguage: 'en',
    longitude: String(longitude),
  });
  const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${params.toString()}`, { signal });
  if (!response.ok) throw new Error('Reverse geocoding is unavailable.');

  const data: unknown = await response.json();
  if (!isReverseGeocodeResponse(data)) return null;

  return [data.city ?? data.locality, data.principalSubdivision, data.countryName]
    .filter((part): part is string => Boolean(part))
    .filter((part, index, parts) => parts.indexOf(part) === index)
    .join(', ') || null;
}
