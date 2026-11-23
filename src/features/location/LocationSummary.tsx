import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { SelectedLocation } from '../../domain/location/locationTypes';
import type { LocationCoordinates } from '../../domain/location/locationTypes';
import { getDistanceKilometers } from '../../domain/location/getDistanceKilometers';
import { getLocationCoordinates } from '../../domain/location/getLocationCoordinates';
import { reverseGeocodeOsmPoint } from '../../services/location/reverseGeocodeOsmPoint';
import { SourceAttribution } from '../../ui/SourceAttribution';
import { uiColors } from '../../ui/visualStyle';
import { formatLocationCoordinates, getLocationName } from './formatLocation';
import { SaveLocationDialog } from './SaveLocationDialog';

type Props = {
  location: SelectedLocation | null;
  isLocationSaved: boolean;
  showSaveAction: boolean;
  onSaveLocation: (location: SelectedLocation, name: string) => void;
  timeZone: string | null;
  timeZoneUnavailable: boolean;
  forecastPoint: LocationCoordinates | null;
};

function formatForecastOffset(distanceKilometers: number): string {
  if (distanceKilometers < 0.5) return 'less than 1 km';
  return `about ${Math.round(distanceKilometers)} km`;
}

export function LocationSummary({
  location,
  isLocationSaved,
  showSaveAction,
  onSaveLocation,
  timeZone,
  timeZoneUnavailable,
  forecastPoint,
}: Props) {
  const [now, setNow] = useState(() => Date.now());
  const [forecastPointName, setForecastPointName] = useState<string | null>(null);
  const [locationPendingSave, setLocationPendingSave] = useState<SelectedLocation | null>(null);
  const selectedCoordinates = location ? getLocationCoordinates(location) : null;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isCurrent = true;
    setForecastPointName(null);
    if (!forecastPoint) return () => { isCurrent = false; };

    void reverseGeocodeOsmPoint(forecastPoint).then((place) => {
      if (isCurrent) setForecastPointName(place?.locality ?? null);
    });
    return () => { isCurrent = false; };
  }, [forecastPoint?.latitude, forecastPoint?.longitude]);

  const localDateTime = location && !timeZone
    ? null
    : new Intl.DateTimeFormat('en', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      ...(timeZone ? { timeZone } : {}),
    }).format(new Date(now));

  return (
    <View style={styles.container}>
      <Text style={localDateTime ? styles.dateTime : styles.timeStatus}>
        {localDateTime ?? (timeZoneUnavailable ? 'Local time unavailable' : 'Finding local time...')}
      </Text>
      {location && (
        <>
          <View style={styles.divider} />
          <Text style={styles.name}>{getLocationName(location)}</Text>
          <Text style={styles.coordinates}>{formatLocationCoordinates(location)}</Text>
          {showSaveAction && <Pressable
            accessibilityLabel={isLocationSaved ? 'Saved location' : 'Add this location to saved locations'}
            accessibilityRole="button"
            accessibilityState={{ disabled: isLocationSaved }}
            disabled={isLocationSaved}
            onPress={() => setLocationPendingSave(location)}
            style={({ pressed }) => [styles.saveLocationButton, pressed && !isLocationSaved && styles.saveLocationButtonPressed]}
          >
            <Text style={[styles.saveLocationText, isLocationSaved && styles.savedLocationText]}>
              {isLocationSaved ? '✓ Saved location' : '+ Add to saved locations'}
            </Text>
          </Pressable>}
          {showSaveAction && (
            <SaveLocationDialog
              coordinates={locationPendingSave ? formatLocationCoordinates(locationPendingSave) : ''}
              defaultName={locationPendingSave ? getLocationName(locationPendingSave) : ''}
              onCancel={() => setLocationPendingSave(null)}
              onSave={(name) => {
                if (!locationPendingSave) return;
                onSaveLocation(locationPendingSave, name);
                setLocationPendingSave(null);
              }}
              visible={locationPendingSave !== null}
            />
          )}
          {forecastPoint && selectedCoordinates && forecastPointName && (
            <Text style={styles.forecastPoint}>
              Forecast point {formatForecastOffset(getDistanceKilometers(selectedCoordinates, forecastPoint))}
              {' from selected location ('}{forecastPointName}{')'}
            </Text>
          )}
          {(location.source === 'place' || location.source === 'map' || (forecastPoint && forecastPointName)) && (
            <View style={styles.attributions}>
              {location.source === 'place' && (
                <SourceAttribution
                  compact
                  label="Place data by Open-Meteo / GeoNames"
                  url="https://open-meteo.com/en/docs/geocoding-api"
                />
              )}
              {(location.source === 'map' || (forecastPoint && forecastPointName)) && (
                <SourceAttribution
                  compact
                  label="© OpenStreetMap contributors"
                  url="https://www.openstreetmap.org/copyright"
                />
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomColor: uiColors.line,
    borderBottomWidth: 1,
    marginTop: 10,
    paddingBottom: 10,
  },
  name: {
    color: uiColors.ink,
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  coordinates: {
    color: uiColors.muted,
    fontSize: 12,
    marginTop: 3,
    textAlign: 'center',
  },
  saveLocationButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    paddingHorizontal: 12,
  },
  saveLocationButtonPressed: { opacity: 0.65 },
  saveLocationText: {
    color: uiColors.muted,
    fontSize: 12,
    fontWeight: '400',
    textDecorationLine: 'underline',
  },
  savedLocationText: { textDecorationLine: 'none' },
  forecastPoint: {
    color: uiColors.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 3,
    textAlign: 'center',
  },
  attributions: {
    marginTop: 2,
    rowGap: 2,
  },
  dateTime: {
    color: uiColors.ink,
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  timeStatus: {
    color: uiColors.muted,
    fontSize: 12,
    textAlign: 'center',
  },
  divider: {
    backgroundColor: uiColors.line,
    height: 1,
    marginBottom: 8,
    marginTop: 10,
    width: 48,
  },
});
