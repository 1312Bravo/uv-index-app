import { useCallback, useEffect, useState } from 'react';

import { getLocationTimeZone } from '../../services/location/getLocationTimeZone';

type LocationTimeZoneState = {
  locationKey: string;
  timeZone: string | null;
  unavailable: boolean;
};

export function useLocationTimeZone(latitude: number | undefined, longitude: number | undefined) {
  const [result, setResult] = useState<LocationTimeZoneState | null>(null);
  const locationKey = latitude !== undefined && longitude !== undefined
    ? `${latitude},${longitude}`
    : null;
  const currentResult = result?.locationKey === locationKey ? result : null;

  const updateFromForecast = useCallback((timeZone: string) => {
    if (!locationKey) return;
    setResult((current) =>
      current?.locationKey === locationKey && current.timeZone === timeZone && !current.unavailable
        ? current
        : { locationKey, timeZone, unavailable: false });
  }, [locationKey]);

  useEffect(() => {
    if (latitude === undefined || longitude === undefined || !locationKey) return;

    const controller = new AbortController();
    getLocationTimeZone(latitude, longitude, controller.signal)
      .then((timeZone) => {
        if (!controller.signal.aborted) updateFromForecast(timeZone);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setResult((current) =>
          current?.locationKey === locationKey && current.timeZone
            ? current
            : { locationKey, timeZone: null, unavailable: true });
      });

    return () => controller.abort();
  }, [latitude, longitude, locationKey, updateFromForecast]);

  return {
    timeZone: currentResult?.timeZone ?? null,
    unavailable: currentResult?.unavailable ?? false,
    updateFromForecast,
  };
}
