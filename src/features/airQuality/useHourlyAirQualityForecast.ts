import { useCallback, useEffect, useState } from 'react';

import type { HourlyAirQualityValue } from '../../domain/airQuality/airQualityTypes';
import type { LocationCoordinates } from '../../domain/location/locationTypes';
import { getHourlyAirQualityForecast } from '../../services/airQuality/getHourlyAirQualityForecast';

type HourlyAirQualityForecastState = {
  hours: HourlyAirQualityValue[] | null;
  error: boolean;
  loading: boolean;
  retry: () => void;
};

export function useHourlyAirQualityForecast(
  latitude: number,
  longitude: number,
  refreshKey: number,
): HourlyAirQualityForecastState {
  const [hours, setHours] = useState<HourlyAirQualityValue[] | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const retry = useCallback(() => setRetryCount((count) => count + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setHours(null);
    setError(false);
    setLoading(true);

    void getHourlyAirQualityForecast({ latitude, longitude } satisfies LocationCoordinates, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setHours(result);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        if (__DEV__) console.warn('[air-quality-forecast] Request failed.', cause);
        setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [latitude, longitude, refreshKey, retryCount]);

  return { hours, error, loading, retry };
}
