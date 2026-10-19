import { useCallback, useEffect, useState } from 'react';

import type { HourlyForecast } from '../../domain/forecast/forecastTypes';
import { getHourlyForecast } from '../../services/forecast/getHourlyForecast';

type HourlyForecastState = {
  forecast: HourlyForecast | null;
  error: string | null;
  loading: boolean;
  retry: () => void;
};

export function useHourlyForecast(
  latitude: number,
  longitude: number,
  errorMessage: string,
  refreshKey = 0,
): HourlyForecastState {
  const [forecast, setForecast] = useState<HourlyForecast | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const retry = useCallback(() => setRetryCount((count) => count + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setForecast(null);
    setError(null);
    setLoading(true);

    async function loadForecast() {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const result = await getHourlyForecast(latitude, longitude, controller.signal);
          if (!controller.signal.aborted) setForecast(result);
          return;
        } catch (cause) {
          if (controller.signal.aborted) return;

          if (__DEV__) {
            console.warn(
              attempt === 0 ? '[forecast] Request failed; retrying.' : '[forecast] Retry failed.',
              cause,
            );
          }
          if (attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, 700));
          } else {
            setError(errorMessage);
          }
        }
      }
    }

    void loadForecast().finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });

    return () => controller.abort();
  }, [errorMessage, latitude, longitude, refreshKey, retryCount]);

  return { forecast, error, loading, retry };
}
