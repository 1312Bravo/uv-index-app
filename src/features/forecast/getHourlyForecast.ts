export type ForecastHour = {
  time: number;
  uv: number;
  temperature: number;
  period: 'past' | 'now' | 'future';
};

export type HourlyForecast = {
  timezone: string;
  hours: ForecastHour[];
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
    current: 'uv_index,temperature_2m',
    hourly: 'uv_index,temperature_2m',
    timezone: 'auto',
    timeformat: 'unixtime',
    past_days: '1',
    forecast_days: '2',
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
  if (!response.ok) {
    throw new Error('Forecast is unavailable.');
  }

  const data = await response.json();
  if (
    !data ||
    typeof data.timezone !== 'string' ||
    !Array.isArray(data.hourly?.time) ||
    !Array.isArray(data.hourly?.uv_index) ||
    !Array.isArray(data.hourly?.temperature_2m)
  ) {
    throw new Error('Forecast data is incomplete.');
  }

  const times: unknown[] = data.hourly.time;
  const now = Date.now() / 1000;
  const currentIndex = times.findLastIndex((time) => isNumber(time) && time <= now);
  if (currentIndex < 5 || currentIndex + 18 >= times.length) {
    throw new Error('The full hourly window is unavailable.');
  }

  const hours: ForecastHour[] = [];
  for (let index = currentIndex - 5; index <= currentIndex + 18; index += 1) {
    const time = times[index];
    const hourlyUv = data.hourly.uv_index[index];
    const hourlyTemperature = data.hourly.temperature_2m[index];
    const current = data.current;
    const useCurrent = index === currentIndex &&
      isNumber(current?.uv_index) && isNumber(current?.temperature_2m);
    const uv = useCurrent ? current.uv_index : hourlyUv;
    const temperature = useCurrent ? current.temperature_2m : hourlyTemperature;

    if (!isNumber(time) || !isNumber(uv) || !isNumber(temperature)) {
      throw new Error('The hourly UV forecast is incomplete.');
    }

    hours.push({
      time,
      uv,
      temperature,
      period: index < currentIndex ? 'past' : index === currentIndex ? 'now' : 'future',
    });
  }

  return { timezone: data.timezone, hours };
}
