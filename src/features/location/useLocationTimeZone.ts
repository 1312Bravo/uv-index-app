import { useCallback, useEffect, useState } from 'react';

import { getLocationTimeZone } from '../../services/location/getLocationTimeZone';
import type { LocationCoordinates } from '../../domain/location/locationTypes';

type LocationTimeZoneState = {
  locationKey: string;
  timeZone: string | null;
  forecastPoint: LocationCoordinates | null;
  unavailable: boolean;
};

export function useLocationTimeZone(latitude: number | undefined, longitude: number | undefined) {
  const [result, setResult] = useState<LocationTimeZoneState | null>(null);
  const locationKey = latitude !== undefined && longitude !== undefined
    ? `${latitude},${longitude}`
    : null;
  const currentResult = result?.locationKey === locationKey ? result : null;

  const updateFromForecast = useCallback((timeZone: string, forecastPoint?: LocationCoordinates | null) => {
    if (!locationKey) return;
    setResult((current) => {
      const currentPoint = current?.locationKey === locationKey ? current.forecastPoint : null;
      const nextPoint = forecastPoint === undefined ? currentPoint : forecastPoint;
      if (
        current?.locationKey === locationKey && current.timeZone === timeZone &&
        current.forecastPoint?.latitude === nextPoint?.latitude &&
        current.forecastPoint?.longitude === nextPoint?.longitude && !current.unavailable
      ) return current;

      return { locationKey, timeZone, forecastPoint: nextPoint, unavailable: false };
    });
  }, [locationKey]);

  useEffect(() => {
    if (latitude === undefined || longitude === undefined || !locationKey) return;

    const controller = new AbortController();
    getLocationTimeZone(latitude, longitude, controller.signal)
      .then(({ timeZone, forecastPoint }) => {
        if (!controller.signal.aborted) updateFromForecast(timeZone, forecastPoint);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setResult((current) =>
          current?.locationKey === locationKey && current.timeZone
            ? current
            : { locationKey, timeZone: null, forecastPoint: null, unavailable: true });
      });

    return () => controller.abort();
  }, [latitude, longitude, locationKey, updateFromForecast]);

  return {
    timeZone: currentResult?.timeZone ?? null,
    forecastPoint: currentResult?.forecastPoint ?? null,
    unavailable: currentResult?.unavailable ?? false,
    updateFromForecast,
  };
}
