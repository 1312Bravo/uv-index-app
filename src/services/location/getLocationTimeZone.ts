export async function getLocationTimeZone(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<string> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m',
    timezone: 'auto',
    forecast_days: '1',
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
  if (!response.ok) throw new Error('The location time zone is unavailable.');

  const data = await response.json();
  if (typeof data?.timezone !== 'string' || !data.timezone) {
    throw new Error('The location time zone is unavailable.');
  }

  // Check that the returned zone can be used for local date and time formatting.
  new Intl.DateTimeFormat('en', { timeZone: data.timezone });
  return data.timezone;
}
