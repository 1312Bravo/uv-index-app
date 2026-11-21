import { useEffect, useRef, useState } from 'react';

import type { SelectedLocation } from '../../domain/location/locationTypes';
import { getSavedLocations, storeSavedLocations } from '../../services/location/savedLocationsStorage';

export function getSavedLocationId(location: SelectedLocation): string {
  if (location.source === 'place') return `place:${location.place.id}`;

  const latitude = location.latitude.toFixed(4);
  const longitude = location.longitude.toFixed(4);
  return `coordinates:${latitude},${longitude}`;
}

export function useSavedLocations() {
  const [locations, setLocations] = useState<SelectedLocation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const locationsRef = useRef<SelectedLocation[]>([]);

  useEffect(() => {
    let isActive = true;
    void getSavedLocations().then((saved) => {
      if (!isActive) return;
      locationsRef.current = saved;
      setLocations(saved);
      setIsLoaded(true);
    });
    return () => { isActive = false; };
  }, []);

  function saveLocation(location: SelectedLocation) {
    const current = locationsRef.current;
    const id = getSavedLocationId(location);
    if (current.some((saved) => getSavedLocationId(saved) === id)) return;

    const next = [...current, location];
    locationsRef.current = next;
    setLocations(next);
    void storeSavedLocations(next).catch(() => {});
  }

  function removeLocation(location: SelectedLocation) {
    const id = getSavedLocationId(location);
    const next = locationsRef.current.filter((saved) => getSavedLocationId(saved) !== id);
    locationsRef.current = next;
    setLocations(next);
    void storeSavedLocations(next).catch(() => {});
  }

  return { isLoaded, locations, removeLocation, saveLocation };
}
