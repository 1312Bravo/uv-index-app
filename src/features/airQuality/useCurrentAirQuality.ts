import { useCallback, useEffect, useState } from 'react';

import type { CurrentAirQuality } from '../../domain/airQuality/airQualityTypes';
import type { LocationCoordinates } from '../../domain/location/locationTypes';
import { getCurrentAirQuality } from '../../services/airQuality/getCurrentAirQuality';

type CurrentAirQualityState = {
  airQuality: CurrentAirQuality | null;
  error: boolean;
  loading: boolean;
  retry: () => void;
};

export function useCurrentAirQuality(
  latitude: number,
  longitude: number,
  refreshKey: number,
): CurrentAirQualityState {
  const [airQuality, setAirQuality] = useState<CurrentAirQuality | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const retry = useCallback(() => setRetryCount((count) => count + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setAirQuality(null);
    setError(false);
    setLoading(true);

    void getCurrentAirQuality({ latitude, longitude } satisfies LocationCoordinates, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setAirQuality(result);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        if (__DEV__) console.warn('[air-quality] Request failed.', cause);
        setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [latitude, longitude, refreshKey, retryCount]);

  return { airQuality, error, loading, retry };
}
