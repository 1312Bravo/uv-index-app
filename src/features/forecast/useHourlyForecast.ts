import { useEffect, useState } from 'react';

import type { HourlyForecast } from '../../domain/forecast/forecastTypes';
import { getHourlyForecast } from '../../services/forecast/getHourlyForecast';

type HourlyForecastState = {
  forecast: HourlyForecast | null;
  error: string | null;
  loading: boolean;
};

export function useHourlyForecast(
  latitude: number,
  longitude: number,
  errorMessage: string,
): HourlyForecastState {
  const [forecast, setForecast] = useState<HourlyForecast | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setForecast(null);
    setError(null);
    setLoading(true);

    getHourlyForecast(latitude, longitude, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setForecast(result);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(errorMessage);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [errorMessage, latitude, longitude]);

  return { forecast, error, loading };
}
