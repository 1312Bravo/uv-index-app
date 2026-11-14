import type { HourlyAirQualityValue } from '../../domain/airQuality/airQualityTypes';
import type { LocationCoordinates } from '../../domain/location/locationTypes';
import { fetchForecastJson } from '../forecast/fetchForecastJson';

type OpenMeteoAirQualityData = {
  hourly?: {
    time?: unknown;
    european_aqi?: unknown;
  };
};

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export async function getHourlyAirQualityForecast(
  coordinates: LocationCoordinates,
  signal?: AbortSignal,
): Promise<HourlyAirQualityValue[]> {
  const params = new URLSearchParams({
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
    hourly: 'european_aqi',
    forecast_days: '2',
    timezone: 'auto',
    timeformat: 'unixtime',
  });
  const data = await fetchForecastJson<OpenMeteoAirQualityData>(
    `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`,
    signal,
  );
  const times = data.hourly?.time;
  const values = data.hourly?.european_aqi;
  if (
    !Array.isArray(times) ||
    !Array.isArray(values) ||
    times.length === 0 ||
    times.length !== values.length ||
    !times.every(isNumber) ||
    !values.every((value) => value === null || (isNumber(value) && value >= 0))
  ) {
    throw new Error('Hourly air-quality forecast data is incomplete.');
  }

  return times.map((time, index) => ({
    time,
    europeanAqi: values[index] as number | null,
  }));
}
