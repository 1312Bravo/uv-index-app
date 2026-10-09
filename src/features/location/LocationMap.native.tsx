import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { getLocationCoordinates } from '../../domain/location/getLocationCoordinates';
import type { LocationMapProps } from './LocationMapProps';
import { createNativeMapDocument } from './nativeMapDocument';

const MAP_DOCUMENT = createNativeMapDocument();

export function LocationMap({
  selectedLocation,
  onSelectCoordinates,
  onInteractionChange,
}: LocationMapProps) {
  const mapRef = useRef<WebView>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const coordinates = selectedLocation ? getLocationCoordinates(selectedLocation) : null;

  useEffect(() => {
    if (!isMapReady || !coordinates) return;

    const { latitude, longitude } = coordinates;
    mapRef.current?.injectJavaScript(
      `window.uvScoutSelectLocation(${latitude}, ${longitude}, ${selectedLocation?.source !== 'map'}); true;`,
    );
  }, [coordinates?.latitude, coordinates?.longitude, isMapReady, selectedLocation?.source]);

  function handleMapMessage(event: WebViewMessageEvent) {
    try {
      const message: unknown = JSON.parse(event.nativeEvent.data);
      if (!message || typeof message !== 'object' || !('type' in message) || message.type !== 'select') {
        return;
      }

      if (!('latitude' in message) || !('longitude' in message)) return;
      const { latitude, longitude } = message;
      if (typeof latitude !== 'number' || typeof longitude !== 'number') return;
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return;

      onSelectCoordinates(latitude, longitude);
    } catch {
      // Ignore malformed messages from the embedded map document.
    }
  }

  return (
    <View style={styles.frame}>
      <WebView
        ref={mapRef}
        javaScriptEnabled
        onError={() => setIsMapReady(false)}
        onLoadEnd={() => setIsMapReady(true)}
        onMessage={handleMapMessage}
        nestedScrollEnabled
        onTouchCancel={() => onInteractionChange?.(false)}
        onTouchEnd={() => onInteractionChange?.(false)}
        onTouchStart={() => onInteractionChange?.(true)}
        originWhitelist={['*']}
        scrollEnabled={false}
        source={{ html: MAP_DOCUMENT }}
        style={styles.map}
      />
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
