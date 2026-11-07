import type { LocationCoordinates } from '../../domain/location/locationTypes';

type PhotonResponse = {
  features?: Array<{
    properties?: {
      city?: unknown;
      country?: unknown;
      county?: unknown;
      locality?: unknown;
      name?: unknown;
      state?: unknown;
    };
  }>;
};

export type OsmPlaceLabel = {
  locality: string;
  fullName: string;
};

const placeLookups = new Map<string, Promise<OsmPlaceLabel | null>>();
let lastRequestStartedAt = 0;
let requestQueue = Promise.resolve();

function getText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function getPlaceLabel(data: PhotonResponse): OsmPlaceLabel | null {
  const properties = data.features?.[0]?.properties;
  if (!properties) return null;

  const locality = getText(properties.city) ?? getText(properties.locality) ?? getText(properties.name);
  if (!locality) return null;

  const fullName = [
    locality,
    getText(properties.state) ?? getText(properties.county),
    getText(properties.country),
  ].filter((part, index, parts): part is string => Boolean(part) && parts.indexOf(part) === index).join(', ');

  return { locality, fullName };
}

function waitForRequestSlot(): Promise<void> {
  const nextRequest = requestQueue.then(async () => {
    const waitMilliseconds = Math.max(0, 1000 - (Date.now() - lastRequestStartedAt));
    if (waitMilliseconds > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitMilliseconds));
    }
    lastRequestStartedAt = Date.now();
  });
  requestQueue = nextRequest.catch(() => undefined);
  return nextRequest;
}

async function requestPlaceLabel(point: LocationCoordinates): Promise<OsmPlaceLabel | null> {
  try {
    await waitForRequestSlot();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    const params = new URLSearchParams({
      lat: String(point.latitude),
      lon: String(point.longitude),
      lang: 'en',
    });
    try {
      const response = await fetch(`https://photon.komoot.io/reverse?${params}`, { signal: controller.signal });
      if (!response.ok) return null;

      const data: unknown = await response.json();
      if (!data || typeof data !== 'object') return null;
      return getPlaceLabel(data as PhotonResponse);
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return null;
  }
}

// Cache each location lookup for this app session and avoid duplicate concurrent requests.
export function reverseGeocodeOsmPoint(point: LocationCoordinates): Promise<OsmPlaceLabel | null> {
  const key = `${point.latitude},${point.longitude}`;
  const existing = placeLookups.get(key);
  if (existing) return existing;

  const lookup = requestPlaceLabel(point);
  placeLookups.set(key, lookup);
  return lookup;
}
