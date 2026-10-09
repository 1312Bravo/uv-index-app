import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './locationMap.css';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';

import { getLocationCoordinates } from '../../domain/location/getLocationCoordinates';
import type { LocationMapProps } from './LocationMapProps';
import {
  LOCATION_MARKER_ANCHOR,
  LOCATION_MARKER_CLASS,
  LOCATION_MARKER_HTML,
  LOCATION_MARKER_SIZE,
} from './locationMapMarker';

const EUROPE_CENTER: L.LatLngExpression = [50.5, 15];
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const LOCATION_MARKER_ICON = L.divIcon({
  className: LOCATION_MARKER_CLASS,
  html: LOCATION_MARKER_HTML,
  iconSize: [LOCATION_MARKER_SIZE, LOCATION_MARKER_SIZE],
  iconAnchor: [LOCATION_MARKER_ANCHOR, LOCATION_MARKER_ANCHOR],
});

function MapBehavior({ selectedLocation, onSelectCoordinates }: LocationMapProps) {
  const map = useMap();
  const coordinates = selectedLocation ? getLocationCoordinates(selectedLocation) : null;

  useMapEvents({
    click(event) {
      onSelectCoordinates(event.latlng.lat, event.latlng.lng);
    },
  });

  useEffect(() => {
    if (!coordinates || selectedLocation?.source === 'map') return;
    map.flyTo([coordinates.latitude, coordinates.longitude], 14, { duration: 0.45 });
  }, [coordinates?.latitude, coordinates?.longitude, map, selectedLocation?.source]);

  useEffect(() => {
    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize({ pan: false, debounceMoveend: true });
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [map]);

  return coordinates ? (
    <Marker
      icon={LOCATION_MARKER_ICON}
      position={[coordinates.latitude, coordinates.longitude]}
    />
  ) : null;
}

export function LocationMap({ selectedLocation, onSelectCoordinates }: LocationMapProps) {
  const selectedCoordinates = selectedLocation ? getLocationCoordinates(selectedLocation) : null;

  return (
    <View style={styles.frame}>
      <MapContainer
        center={selectedCoordinates
          ? [selectedCoordinates.latitude, selectedCoordinates.longitude]
          : EUROPE_CENTER}
        doubleClickZoom
        scrollWheelZoom={false}
        style={styles.map}
        zoom={selectedCoordinates ? 14 : 4}
        zoomControl
      >
        <TileLayer
          attribution={TILE_ATTRIBUTION}
          maxZoom={19}
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBehavior
          onSelectCoordinates={onSelectCoordinates}
          selectedLocation={selectedLocation}
        />
      </MapContainer>
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
  map: { height: '100%', width: '100%' },
});
