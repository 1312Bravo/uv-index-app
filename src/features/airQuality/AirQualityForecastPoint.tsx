import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getDistanceKilometers } from '../../domain/location/getDistanceKilometers';
import type { LocationCoordinates } from '../../domain/location/locationTypes';
import { reverseGeocodeOsmPoint } from '../../services/location/reverseGeocodeOsmPoint';
import { uiColors } from '../../ui/visualStyle';
import { AirQualitySourceAttribution } from './AirQualitySourceAttribution';

export function AirQualityForecastPoint({ selectedPoint, forecastPoint }: {
  selectedPoint: LocationCoordinates;
  forecastPoint: LocationCoordinates | null;
}) {
  const pointKey = forecastPoint ? `${forecastPoint.latitude},${forecastPoint.longitude}` : null;
  const [placeLookup, setPlaceLookup] = useState<{ key: string; name: string | null } | null>(null);

  useEffect(() => {
    let active = true;
    if (forecastPoint && pointKey) {
      void reverseGeocodeOsmPoint(forecastPoint).then((place) => {
        if (active) setPlaceLookup({ key: pointKey, name: place?.locality ?? null });
      });
    }
    return () => { active = false; };
  }, [pointKey]);

  const placeName = placeLookup?.key === pointKey ? placeLookup.name : null;
  const distance = forecastPoint ? getDistanceKilometers(selectedPoint, forecastPoint) : null;
  const offset = distance === null ? null : distance < 0.5 ? 'less than 1 km' : `about ${Math.round(distance)} km`;
  const pointLabel = placeName ?? (forecastPoint
    ? `${forecastPoint.latitude.toFixed(2)}°, ${forecastPoint.longitude.toFixed(2)}°`
    : null);

  return (
    <View style={styles.container}>
      {pointLabel && (
        <Text style={styles.point}>
          Forecast point {offset} from selected location ({pointLabel})
        </Text>
      )}
      <View style={styles.attribution}>
        <AirQualitySourceAttribution showOpenStreetMap={Boolean(placeName)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  point: { color: uiColors.muted, fontSize: 12, lineHeight: 16, marginTop: 5, textAlign: 'center' },
  attribution: { alignItems: 'center', marginTop: 5 },
});
