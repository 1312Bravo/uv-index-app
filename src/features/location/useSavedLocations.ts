import { useEffect, useRef, useState } from 'react';

import type { SavedLocation } from '../../domain/location/savedLocationTypes';
import type { SelectedLocation } from '../../domain/location/locationTypes';
import { getSavedLocations, storeSavedLocations } from '../../services/location/savedLocationsStorage';
import { getLocationName } from './formatLocation';

export function getSavedLocationId(location: SelectedLocation): string {
  if (location.source === 'place') return `place:${location.place.id}`;

  const latitude = location.latitude.toFixed(4);
  const longitude = location.longitude.toFixed(4);
  return `coordinates:${latitude},${longitude}`;
}

export function useSavedLocations() {
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const locationsRef = useRef<SavedLocation[]>([]);

  useEffect(() => {
    let isActive = true;
    void getSavedLocations().then((saved) => {
      if (!isActive) return;
      const withNames = saved.map((entry) => ({
        ...entry,
        name: entry.name.trim() || getLocationName(entry.location),
      }));
      locationsRef.current = withNames;
      setLocations(withNames);
      setIsLoaded(true);
    });
    return () => { isActive = false; };
  }, []);

  function saveLocation(location: SelectedLocation, name: string) {
    const current = locationsRef.current;
    const id = getSavedLocationId(location);
    if (current.some((saved) => getSavedLocationId(saved.location) === id)) return;

    const next = [...current, { location, name: name.trim() || getLocationName(location) }];
    locationsRef.current = next;
    setLocations(next);
    void storeSavedLocations(next).catch(() => {});
  }

  function removeLocation(location: SelectedLocation) {
    const id = getSavedLocationId(location);
    const next = locationsRef.current.filter((saved) => getSavedLocationId(saved.location) !== id);
    locationsRef.current = next;
    setLocations(next);
    void storeSavedLocations(next).catch(() => {});
  }

  return { isLoaded, locations, removeLocation, saveLocation };
}
