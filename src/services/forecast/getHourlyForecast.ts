import type { ForecastHour, HourlyForecast } from '../../domain/forecast/forecastTypes';
import { getDaylightEvents, getLocalDateKey } from '../../domain/daylight/getDaylightEvents';
import { fetchForecastJson } from './fetchForecastJson';

type OpenMeteoForecastData = {
  timezone: string;
  hourly: {
    time: unknown[];
    uv_index: unknown[];
    temperature_2m: unknown[];
    cloud_cover: unknown[];
    precipitation_probability?: unknown[];
    precipitation?: unknown[];
    wind_speed_10m?: unknown[];
    wind_gusts_10m?: unknown[];
  };
  current?: {
    time?: unknown;
    interval?: unknown;
    uv_index?: unknown;
    temperature_2m?: unknown;
    cloud_cover?: unknown;
    precipitation?: unknown;
    wind_speed_10m?: unknown;
    wind_gusts_10m?: unknown;
  };
};

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export async function getHourlyForecast(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<HourlyForecast> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'uv_index,temperature_2m,cloud_cover,precipitation,wind_speed_10m,wind_gusts_10m',
    hourly: 'uv_index,temperature_2m,cloud_cover,precipitation_probability,precipitation,wind_speed_10m,wind_gusts_10m',
    timezone: 'auto',
    timeformat: 'unixtime',
    past_days: '1',
    forecast_days: '2',
  });
  const data = await fetchForecastJson<OpenMeteoForecastData>(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    signal,
  );
  if (
    !data ||
    typeof data.timezone !== 'string' ||
    !Array.isArray(data.hourly?.time) ||
    !Array.isArray(data.hourly?.uv_index) ||
    !Array.isArray(data.hourly?.temperature_2m) ||
    !Array.isArray(data.hourly?.cloud_cover)
  ) {
    throw new Error('Forecast data is incomplete.');
  }

  const times: unknown[] = data.hourly.time;
  const now = Date.now() / 1000;
  const currentIndex = times.findLastIndex((time) => isNumber(time) && time <= now);
  const current = data.current;
  const currentWindGust = isNumber(current?.wind_gusts_10m) && current.wind_gusts_10m >= 0
    ? current.wind_gusts_10m
    : null;
  const currentPrecipitation = isNumber(current?.precipitation)
    ? current.precipitation
    : null;
  const currentPrecipitationInterval = isNumber(current?.interval)
    ? current.interval
    : null;
  const currentPrecipitationTime = isNumber(current?.time) ? current.time : null;
  const currentConditionsTime = isNumber(current?.time) &&
    isNumber(current?.uv_index) && isNumber(current?.temperature_2m)
    ? current.time
    : null;
  if (currentIndex < 5 || currentIndex + 18 >= times.length) {
    throw new Error('The full hourly window is unavailable.');
  }

  const hours: ForecastHour[] = [];
  // Keep the full requested forecast for outing planning; charts choose their own window.
  for (let index = currentIndex - 5; index < times.length; index += 1) {
    const time = times[index];
    const hourlyUv = data.hourly.uv_index[index];
    const hourlyTemperature = data.hourly.temperature_2m[index];
    const hourlyCloudCover = data.hourly.cloud_cover[index];
    const hourlyPrecipitationProbability = data.hourly.precipitation_probability?.[index];
    const hourlyPrecipitation = data.hourly.precipitation?.[index];
    const hourlyWindSpeed = data.hourly.wind_speed_10m?.[index];
    const hourlyWindGust = data.hourly.wind_gusts_10m?.[index];
    const useCurrent = index === currentIndex &&
      currentConditionsTime !== null;
    const uv = useCurrent && isNumber(current?.uv_index) ? current.uv_index : hourlyUv;
    const temperature = useCurrent && isNumber(current?.temperature_2m)
      ? current.temperature_2m
      : hourlyTemperature;
    const cloudCover = useCurrent && isNumber(current?.cloud_cover)
      ? current.cloud_cover
      : isNumber(hourlyCloudCover) ? hourlyCloudCover : null;
    const windSpeed = useCurrent && isNumber(current?.wind_speed_10m)
      ? current.wind_speed_10m
      : isNumber(hourlyWindSpeed) ? hourlyWindSpeed : null;

    if (!isNumber(time) || !isNumber(uv) || !isNumber(temperature)) {
      throw new Error('The hourly UV forecast is incomplete.');
    }

    hours.push({
      time,
      uv,
      hourlyUv: isNumber(hourlyUv) ? hourlyUv : uv,
      temperature,
      cloudCover,
      hourlyCloudCover: isNumber(hourlyCloudCover) ? hourlyCloudCover : null,
      precipitationProbability: isNumber(hourlyPrecipitationProbability)
        ? hourlyPrecipitationProbability
        : null,
      precipitation: isNumber(hourlyPrecipitation) ? hourlyPrecipitation : null,
      windSpeed,
      windGust: isNumber(hourlyWindGust) && hourlyWindGust >= 0 ? hourlyWindGust : null,
      period: index < currentIndex ? 'past' : index === currentIndex ? 'now' : 'future',
    });
  }

  const previousDate = getLocalDateKey(hours[0].time - 86_400, data.timezone);
  const lastDate = getLocalDateKey(hours[hours.length - 1].time, data.timezone);
  const [lastYear, lastMonth, lastDay] = lastDate.split('-').map(Number);
  // The following sunrise lets the nighttime arc reach the final chart bin.
  const followingDate = new Date(Date.UTC(lastYear, lastMonth - 1, lastDay + 1))
    .toISOString()
    .slice(0, 10);
  const dates = [...new Set([
    previousDate,
    ...hours.map(({ time }) => getLocalDateKey(time, data.timezone)),
    followingDate,
  ])];
  const daylight = dates.map((date) => getDaylightEvents(date, latitude, longitude));

  return {
    timezone: data.timezone,
    currentConditionsTime,
    currentWindGust,
    currentPrecipitation,
    currentPrecipitationInterval,
    currentPrecipitationTime,
    hours,
    daylight,
  };
}
