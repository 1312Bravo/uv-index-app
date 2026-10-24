import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import type { Place, SelectedLocation } from '../../domain/location/locationTypes';
import { reverseGeocodePlace } from '../../services/location/reverseGeocode';
import { searchPlaces } from '../../services/location/searchPlaces';
import { SourceAttribution } from '../../ui/SourceAttribution';
import { uiColors, uiType } from '../../ui/visualStyle';
import { formatPlaceName } from './formatLocation';
import { LocationMap } from './LocationMap';
import { LocationUnavailableNotice } from './LocationUnavailableNotice';

type Props = {
  onSelect: (location: SelectedLocation | null) => void;
  onMapInteractionChange: (isInteracting: boolean) => void;
};

export function LocationPicker({ onSelect, onMapInteractionChange }: Props) {
  const { width } = useWindowDimensions();
  const isWideWeb = Platform.OS === 'web' && width >= 760;
  const [query, setQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [results, setResults] = useState<Place[]>([]);
  const [selected, setSelected] = useState<SelectedLocation | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const locationRequest = useRef(0);
  const autoLocationStarted = useRef(false);

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

  const useDeviceLocation = useCallback(async (requestPermission = true, showUnavailableNotice = false) => {
    const requestId = ++locationRequest.current;
    let hasCachedPosition = false;
    setIsLocating(true);
    setError(null);
    setLocationNotice(null);
    setSelected(null);
    onSelect(null);
    setQuery('');
    setResults([]);
    setHasSearched(false);

    function reportUnavailable(message: string) {
      if (requestId !== locationRequest.current) return;
      setError(message);
      if (showUnavailableNotice) setLocationNotice(message);
    }

    try {
      const permission = requestPermission
        ? await Location.requestForegroundPermissionsAsync()
        : await Location.getForegroundPermissionsAsync();
      if (!permission.granted) {
        reportUnavailable('Location access is off. Search for a place, or enable access and try again.');
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        reportUnavailable('Turn on your phone’s location services, or search for a place.');
        return;
      }

      try {
        const lastKnownPosition = await Location.getLastKnownPositionAsync({
          maxAge: 5 * 60_000,
          requiredAccuracy: 2_000,
        });
        if (lastKnownPosition && requestId === locationRequest.current) {
          const recentLocation: SelectedLocation = {
            source: 'device',
            latitude: lastKnownPosition.coords.latitude,
            longitude: lastKnownPosition.coords.longitude,
          };
          setSelected(recentLocation);
          onSelect(recentLocation);
          hasCachedPosition = true;
          setIsLocating(false);
        }
      } catch {
        // Continue to a fresh position if no cached position is available.
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (requestId !== locationRequest.current) return;
      const location: SelectedLocation = {
        source: 'device',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setSelected(location);
      onSelect(location);

      void reverseGeocodePlace(location.latitude, location.longitude)
        .then((placeName) => {
          if (requestId !== locationRequest.current || !placeName) return;
          const resolvedLocation: SelectedLocation = { ...location, placeName };
          setSelected(resolvedLocation);
          onSelect(resolvedLocation);
        })
        .catch(() => {
          // Keep the coordinates when the approximate place lookup is unavailable.
        });
      setResults([]);
      setHasSearched(false);
    } catch {
      if (!hasCachedPosition) {
        reportUnavailable('Could not get your location. Search for a place or try again.');
      }
    } finally {
      setIsLocating(false);
    }
  }, [onSelect]);

  useEffect(() => {
    if (autoLocationStarted.current) return;

    let isActive = true;
    const initialRequest = locationRequest.current;

    async function selectDeviceLocationOnStartup() {
      try {
        if (!isActive || locationRequest.current !== initialRequest) return;
        const isWeb = Platform.OS === 'web';

        if (isWeb) {
          const permission = await Location.getForegroundPermissionsAsync();
          if (!permission.granted) return;
        }

        if (!isActive || locationRequest.current !== initialRequest) return;
        autoLocationStarted.current = true;
        await useDeviceLocation(!isWeb);
      } catch {
        // Keep location manual when the device cannot provide a permission or service status.
      }
    }

    void selectDeviceLocationOnStartup();
    return () => { isActive = false; };
  }, [useDeviceLocation]);

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
      <Text style={styles.heading}>Location</Text>
      <View>
        <View style={isWideWeb ? styles.webSearch : undefined}>
          <View style={styles.locationMethods}>
            <Pressable
              accessibilityRole="button"
              disabled={isLocating}
              onPress={() => { void useDeviceLocation(true, Platform.OS !== 'web'); }}
              style={({ pressed }) => [
                styles.locationButton,
                pressed && styles.locationButtonPressed,
                isLocating && styles.buttonDisabled,
              ]}
            >
              {isLocating ? (
                <ActivityIndicator color="#151515" />
              ) : (
                <Text style={styles.locationButtonText}>
                  {selected?.source === 'device' ? 'Current location selected' : 'Use my location'}
                </Text>
              )}
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.or}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.searchField}>
              <TextInput
                accessibilityLabel={selected ? 'Search a different location' : 'Search location'}
                autoCapitalize="words"
                onBlur={() => setIsSearchFocused(false)}
                onChangeText={(value) => {
                  locationRequest.current += 1;
                  setQuery(value);
                  setResults([]);
                  setHasSearched(false);
                  setSelected(null);
                  onSelect(null);
                  setError(null);
                }}
                onFocus={() => setIsSearchFocused(true)}
                cursorColor="#777777"
                returnKeyType="done"
                selectionColor="#777777"
                style={styles.input}
                value={query}
              />
              {!query && !isSearchFocused && (
                <Text pointerEvents="none" style={styles.searchPrompt}>
                  {selected ? 'Search a different location' : 'Search location'}
                </Text>
              )}
            </View>
          </View>

          {isSearching && <Text style={styles.message}>Searching places...</Text>}

          {results.length > 0 && (
            <>
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
              <SourceAttribution label="Place data by Open-Meteo / GeoNames" url="https://open-meteo.com/en/docs/geocoding-api" />
            </>
          )}

          {hasSearched && results.length === 0 && (
            <Text style={styles.message}>No places found. Try a nearby city or a fuller name.</Text>
          )}

          {error && <Text style={styles.error}>{error}</Text>}
        </View>

        <View style={isWideWeb ? styles.webMap : undefined}>
          <Text style={styles.mapHint}>Tap the map to choose a location</Text>
          <LocationMap
            onInteractionChange={onMapInteractionChange}
            onSelectCoordinates={selectMapCoordinates}
            selectedLocation={selected}
          />
        </View>
      </View>
      {Platform.OS !== 'web' && (
        <LocationUnavailableNotice message={locationNotice} onClose={() => setLocationNotice(null)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: uiColors.ink,
    fontSize: uiType.sectionHeading,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  mapHint: {
    color: uiColors.muted,
    fontSize: uiType.caption,
    marginBottom: 8,
    marginTop: 18,
    textAlign: 'center',
  },
  webSearch: { alignSelf: 'center', maxWidth: 640, width: '100%' },
  webMap: { alignSelf: 'center', maxWidth: 920, width: '100%' },
  input: {
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
    color: uiColors.ink,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
    textAlign: 'center',
  },
  searchField: { justifyContent: 'center', minHeight: 48 },
  searchPrompt: {
    color: '#909090',
    fontSize: 15,
    left: 0,
    position: 'absolute',
    right: 0,
    textAlign: 'center',
  },
  locationButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  locationButtonPressed: { opacity: 0.6 },
  locationButtonText: {
    color: uiColors.ink,
    fontSize: 15,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  locationMethods: {
    alignSelf: 'stretch',
    backgroundColor: uiColors.white,
    borderColor: uiColors.line,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 14,
  },
  dividerLine: {
    backgroundColor: uiColors.line,
    flex: 1,
    height: 1,
  },
  buttonPressed: {
    opacity: 0.65,
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
  message: {
    color: '#666666',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  error: {
    alignSelf: 'center',
    color: '#A6A6A6',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
    marginTop: 18,
    maxWidth: 260,
    textAlign: 'center',
  },
});
