import MapView, { Marker, type Region } from 'react-native-maps';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { getLocationCoordinates } from '../../domain/location/getLocationCoordinates';
import { getLocationName } from './formatLocation';
import type { LocationMapProps } from './LocationMapProps';

const EUROPE_REGION: Region = {
  latitude: 50.5,
  longitude: 15,
  latitudeDelta: 42,
  longitudeDelta: 55,
};

function getSelectedRegion(selectedLocation: LocationMapProps['selectedLocation']): Region | null {
  if (!selectedLocation) return null;
  const coordinates = getLocationCoordinates(selectedLocation);
  return { ...coordinates, latitudeDelta: 0.12, longitudeDelta: 0.12 };
}

export function LocationMap({ selectedLocation, onSelectCoordinates }: LocationMapProps) {
  const mapRef = useRef<MapView>(null);
  const coordinates = selectedLocation ? getLocationCoordinates(selectedLocation) : null;
  const selectedRegion = getSelectedRegion(selectedLocation);

  useEffect(() => {
    if (selectedRegion) mapRef.current?.animateToRegion(selectedRegion, 450);
  }, [selectedRegion?.latitude, selectedRegion?.longitude]);

  return (
    <View style={styles.frame}>
      <MapView
        ref={mapRef}
        initialRegion={selectedRegion ?? EUROPE_REGION}
        onMapReady={() => {
          if (selectedRegion) mapRef.current?.animateToRegion(selectedRegion, 0);
        }}
        onPress={(event) => onSelectCoordinates(
          event.nativeEvent.coordinate.latitude,
          event.nativeEvent.coordinate.longitude,
        )}
        style={styles.map}
      >
        {coordinates && (
          <Marker
            coordinate={coordinates}
            title={selectedLocation ? getLocationName(selectedLocation) : 'Selected map location'}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderColor: '#E2E2E2',
    borderRadius: 12,
    borderWidth: 1,
    height: 280,
    overflow: 'hidden',
    width: '100%',
  },
  map: { flex: 1 },
});
