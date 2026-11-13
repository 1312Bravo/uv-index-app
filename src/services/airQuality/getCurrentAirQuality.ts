import type { CurrentAirQuality } from '../../domain/airQuality/airQualityTypes';
import type { LocationCoordinates } from '../../domain/location/locationTypes';
import { fetchForecastJson } from '../forecast/fetchForecastJson';

type OpenMeteoAirQualityData = {
  timezone?: unknown;
  current?: {
    time?: unknown;
    european_aqi?: unknown;
  };
};

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export async function getCurrentAirQuality(
  coordinates: LocationCoordinates,
  signal?: AbortSignal,
): Promise<CurrentAirQuality> {
  const params = new URLSearchParams({
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
    current: 'european_aqi',
    timezone: 'auto',
    timeformat: 'unixtime',
  });
  const data = await fetchForecastJson<OpenMeteoAirQualityData>(
    `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`,
    signal,
  );
  const current = data.current;
  if (
    typeof data.timezone !== 'string' ||
    !current ||
    !isNumber(current.time) ||
    !isNumber(current.european_aqi) ||
    current.european_aqi < 0
  ) {
    throw new Error('Air quality data is incomplete.');
  }

  return {
    europeanAqi: current.european_aqi,
    time: current.time,
    timezone: data.timezone,
  };
}
