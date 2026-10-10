import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { Place, SelectedLocation } from '../../domain/location/locationTypes';
import { reverseGeocodePlace } from '../../services/location/reverseGeocode';
import { searchPlaces } from '../../services/location/searchPlaces';
import { formatLocationCoordinates, formatPlaceName, getLocationName } from './formatLocation';
import { LocationMap } from './LocationMap';

type Props = {
  onSelect: (location: SelectedLocation | null) => void;
  onMapInteractionChange: (isInteracting: boolean) => void;
};

export function LocationPicker({ onSelect, onMapInteractionChange }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [selected, setSelected] = useState<SelectedLocation | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const locationRequest = useRef(0);

  useEffect(() => {
    const term = query.trim();
    setResults([]);
    setHasSearched(false);
    setIsSearching(false);

    if (term.length < 3 || selected?.source === 'place') {
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsSearching(true);

      try {
        const places = await searchPlaces(term, controller.signal);
        if (!controller.signal.aborted) {
          setResults(places);
          setHasSearched(true);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError('Place search is unavailable. Please try again.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, selected?.source]);

  async function useDeviceLocation() {
    const requestId = ++locationRequest.current;
    setIsLocating(true);
    setError(null);
    setSelected(null);
    onSelect(null);
    setQuery('');
    setResults([]);
    setHasSearched(false);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setError('Location access is off. Search for a place, or enable access and try again.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const location: SelectedLocation = {
        source: 'device',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setSelected(location);
      onSelect(location);

      try {
        const placeName = await reverseGeocodePlace(location.latitude, location.longitude);
        if (requestId === locationRequest.current && placeName) {
          const resolvedLocation: SelectedLocation = { ...location, placeName };
          setSelected(resolvedLocation);
          onSelect(resolvedLocation);
        }
      } catch {
        // Keep the coordinates when the approximate place lookup is unavailable.
      }
      setResults([]);
      setHasSearched(false);
    } catch {
      setError('Could not get your location. Search for a place or try again.');
    } finally {
      setIsLocating(false);
    }
  }

  function selectPlace(place: Place) {
    locationRequest.current += 1;
    const location: SelectedLocation = { source: 'place', place };
    setSelected(location);
    onSelect(location);
    // The selected place is displayed above the search controls. Keep the input
    // empty so its centered caret does not jump to the end of the place name.
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setError(null);
  }

  async function selectMapCoordinates(latitude: number, longitude: number) {
    const requestId = ++locationRequest.current;
    const location: SelectedLocation = { source: 'map', latitude, longitude };
    setSelected(location);
    onSelect(location);
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setError(null);

    try {
      const placeName = await reverseGeocodePlace(latitude, longitude);
      if (requestId === locationRequest.current && placeName) {
        const resolvedLocation: SelectedLocation = { ...location, placeName };
        setSelected(resolvedLocation);
        onSelect(resolvedLocation);
      }
    } catch {
      // Coordinates remain usable if the optional place label lookup fails.
    }
  }

  return (
    <View>
      {selected && (
        <View style={styles.selected}>
          <Text style={styles.selectedName}>{getLocationName(selected)}</Text>
          <Text style={styles.selectedCoordinates}>{formatLocationCoordinates(selected)}</Text>
        </View>
      )}

      <Text style={styles.heading}>Location</Text>

      <View style={styles.locationMethods}>
        <Pressable
          accessibilityRole="button"
          disabled={isLocating}
          onPress={useDeviceLocation}
          style={({ pressed }) => [
            styles.locationButton,
            pressed && styles.locationButtonPressed,
            isLocating && styles.buttonDisabled,
          ]}
        >
          {isLocating ? (
            <ActivityIndicator color="#151515" />
          ) : (
            <Text style={styles.locationButtonText}>Use my location</Text>
          )}
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.or}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TextInput
          accessibilityLabel="Search location"
          autoCapitalize="words"
          onChangeText={(value) => {
            locationRequest.current += 1;
            setQuery(value);
            setResults([]);
            setHasSearched(false);
            setSelected(null);
            onSelect(null);
            setError(null);
          }}
          cursorColor="#777777"
          placeholder="Search location"
          placeholderTextColor="#909090"
          returnKeyType="done"
          selectionColor="#777777"
          style={styles.input}
          value={query}
        />
      </View>

      {isSearching && <Text style={styles.message}>Searching places...</Text>}

      {results.length > 0 && (
        <View style={styles.results}>
          {results.map((place) => (
            <Pressable
              accessibilityRole="button"
              key={place.id}
              onPress={() => selectPlace(place)}
              style={({ pressed }) => [styles.result, pressed && styles.buttonPressed]}
            >
              <Text style={styles.resultText}>{formatPlaceName(place)}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {hasSearched && results.length === 0 && (
        <Text style={styles.message}>No places found. Try a nearby city or a fuller name.</Text>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.mapHint}>Tap the map to choose a location</Text>
      <LocationMap
        onInteractionChange={onMapInteractionChange}
        onSelectCoordinates={selectMapCoordinates}
        selectedLocation={selected}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: '#151515',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  mapHint: {
    color: '#777777',
    fontSize: 13,
    marginBottom: 8,
    marginTop: 18,
    textAlign: 'center',
  },
  input: {
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    color: '#151515',
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
    textAlign: 'center',
  },
  locationButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  locationButtonPressed: { opacity: 0.6 },
  locationButtonText: {
    color: '#151515',
    fontSize: 15,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  locationMethods: {
    alignSelf: 'stretch',
    borderColor: '#D6D6D6',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 14,
  },
  dividerLine: {
    backgroundColor: '#E8E8E8',
    flex: 1,
    height: 1,
  },
  buttonPressed: {
    backgroundColor: '#F3F3F3',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  results: {
    borderColor: '#E2E2E2',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
    overflow: 'hidden',
  },
  result: {
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  resultText: {
    color: '#151515',
    fontSize: 14,
  },
  or: {
    color: '#8A8A8A',
    fontSize: 12,
    marginHorizontal: 10,
    textAlign: 'center',
  },
  selected: { alignItems: 'center', marginBottom: 16 },
  selectedName: { color: '#333333', fontSize: 15, fontWeight: '600', lineHeight: 20, textAlign: 'center' },
  selectedCoordinates: { color: '#777777', fontSize: 12, marginTop: 3, textAlign: 'center' },
  message: {
    color: '#666666',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  error: {
    color: '#9C3D32',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    textAlign: 'center',
  },
});
