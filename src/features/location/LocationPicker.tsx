import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import type { Place, SelectedLocation } from '../../domain/location/locationTypes';
import {
  BrowserGeolocationError,
  getBrowserCurrentPosition,
  getBrowserLocationPermission,
} from '../../services/location/browserGeolocation';
import { reverseGeocodePlace } from '../../services/location/reverseGeocode';
import { reverseGeocodeOsmPoint } from '../../services/location/reverseGeocodeOsmPoint';
import { searchPlaces } from '../../services/location/searchPlaces';
import { SourceAttribution } from '../../ui/SourceAttribution';
import { uiColors, uiType } from '../../ui/visualStyle';
import { formatPlaceName } from './formatLocation';
import { LocationMap } from './LocationMap';
import { LocationUnavailableNotice } from './LocationUnavailableNotice';
import { LocationActionLabel } from './LocationActionLabel';
import { SavedLocations } from './SavedLocations';

type Props = {
  onSelect: (location: SelectedLocation | null) => void;
  onMapInteractionChange: (isInteracting: boolean) => void;
  savedLocations: SelectedLocation[];
  savedLocationsLoaded: boolean;
  onRemoveSavedLocation: (location: SelectedLocation) => void;
};

export function LocationPicker({
  onSelect,
  onMapInteractionChange,
  savedLocations,
  savedLocationsLoaded,
  onRemoveSavedLocation,
}: Props) {
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
  const browserLocationButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const term = query.trim();
    setResults([]);
    setHasSearched(false);
    setIsSearching(false);

    const selectedLabel = selected?.source === 'place'
      ? formatPlaceName(selected.place)
      : selected?.placeName;
    if (term.length < 3 || term === selectedLabel) {
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
  }, [query, selected]);

  const useDeviceLocation = useCallback(async (
    requestPermission = true,
    showUnavailableNotice = false,
    browserPosition?: Promise<GeolocationPosition>,
  ) => {
    Keyboard.dismiss();
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
      if (Platform.OS === 'web') {
        if (!requestPermission && !browserPosition && await getBrowserLocationPermission() !== 'granted') return;

        const position = await (browserPosition ?? getBrowserCurrentPosition());
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
            // Keep the coordinates when the optional place label lookup is unavailable.
          });
        return;
      }

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
    } catch (cause) {
      if (Platform.OS === 'web' && cause instanceof BrowserGeolocationError) {
        const message = cause.code === 'permission-denied'
          ? 'Allow location access for this website in your browser settings, then try again.'
          : cause.code === 'timeout'
            ? 'UV Scout could not receive your location. Try again, or search for a place or choose one on the map.'
            : cause.code === 'position-unavailable'
              ? 'Your browser could not determine your location. Check your device location settings and try again.'
              : 'Current location is unavailable in this browser. Try a secure connection or choose a place on the map.';
        reportUnavailable(message);
      } else if (!hasCachedPosition) {
        reportUnavailable('Could not get your location. Search for a place or try again.');
      }
    } finally {
      setIsLocating(false);
    }
  }, [onSelect]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const button = browserLocationButton.current;
    if (!button) return;

    function requestBrowserLocation() {
      // Start the browser request in the native click handler, before React updates the page.
      void useDeviceLocation(true, true, getBrowserCurrentPosition());
    }

    button.addEventListener('click', requestBrowserLocation);
    return () => button.removeEventListener('click', requestBrowserLocation);
  }, [useDeviceLocation]);

  useEffect(() => {
    if (autoLocationStarted.current) return;

    let isActive = true;
    const initialRequest = locationRequest.current;

    async function selectDeviceLocationOnStartup() {
      try {
        if (!isActive || locationRequest.current !== initialRequest) return;
        const isWeb = Platform.OS === 'web';

        if (isWeb) {
          const permission = await getBrowserLocationPermission();
          if (permission !== 'granted') return;
        }

        if (!isActive || locationRequest.current !== initialRequest) return;
        autoLocationStarted.current = true;
        const browserPosition = isWeb ? getBrowserCurrentPosition() : undefined;
        await useDeviceLocation(!isWeb, false, browserPosition);
      } catch {
        // Keep location manual when the device cannot provide a permission or service status.
      }
    }

    void selectDeviceLocationOnStartup();
    return () => { isActive = false; };
  }, [useDeviceLocation]);

  function selectPlace(place: Place) {
    Keyboard.dismiss();
    locationRequest.current += 1;
    const location: SelectedLocation = { source: 'place', place };
    setSelected(location);
    onSelect(location);
    setQuery(formatPlaceName(place));
    setResults([]);
    setHasSearched(false);
    setError(null);
  }

  async function selectMapCoordinates(latitude: number, longitude: number) {
    Keyboard.dismiss();
    const requestId = ++locationRequest.current;
    const location: SelectedLocation = { source: 'map', latitude, longitude };
    setSelected(location);
    onSelect(location);
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setError(null);

    try {
      const place = await reverseGeocodeOsmPoint({ latitude, longitude });
      if (requestId === locationRequest.current && place) {
        const resolvedLocation: SelectedLocation = { ...location, placeName: place.fullName };
        setSelected(resolvedLocation);
        onSelect(resolvedLocation);
      }
    } catch {
      // Coordinates remain usable if the optional place label lookup fails.
    }
  }

  function selectLocationFromSavedList(location: SelectedLocation) {
    Keyboard.dismiss();
    locationRequest.current += 1;
    setSelected(location);
    onSelect(location);
    setQuery(location.source === 'place' ? formatPlaceName(location.place) : location.placeName ?? '');
    setResults([]);
    setHasSearched(false);
    setError(null);
  }

  return (
    <View>
      <Text style={styles.heading}>Location</Text>
      <View>
        <View style={isWideWeb ? styles.webSearch : undefined}>
          <View style={styles.locationMethods}>
            <View style={styles.locationOption}>
              {Platform.OS === 'web' ? (
                <button
                  ref={browserLocationButton}
                  type="button"
                  disabled={isLocating}
                  style={{
                    alignItems: 'center',
                    background: 'transparent',
                    border: 0,
                    color: uiColors.ink,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    minHeight: 48,
                    opacity: isLocating ? 0.45 : 1,
                    padding: 0,
                    width: '100%',
                  }}
                >
                  {isLocating ? <ActivityIndicator color={uiColors.accent} /> : (
                    <LocationActionLabel
                      label={selected?.source === 'device' ? 'Current location selected' : 'Use my location'}
                    />
                  )}
                </button>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  disabled={isLocating}
                  onPress={() => { void useDeviceLocation(true, true); }}
                  style={({ pressed }) => [
                    styles.locationButton,
                    pressed && styles.locationButtonPressed,
                    isLocating && styles.buttonDisabled,
                  ]}
                >
                  {isLocating ? (
                    <ActivityIndicator color={uiColors.accent} />
                  ) : (
                    <LocationActionLabel
                      label={selected?.source === 'device' ? 'Current location selected' : 'Use my location'}
                    />
                  )}
                </Pressable>
              )}
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.or}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <SavedLocations
              isLoaded={savedLocationsLoaded}
              locations={savedLocations}
              onRemove={onRemoveSavedLocation}
              onSelect={selectLocationFromSavedList}
            />

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
                  setError(null);
                }}
                onFocus={() => setIsSearchFocused(true)}
                cursorColor={uiColors.accent}
                placeholder={isSearchFocused ? '' : selected ? 'Search a different location' : 'Search location'}
                placeholderTextColor={uiColors.faint}
                returnKeyType="done"
                selectionColor={uiColors.accent}
                style={[
                  styles.input,
                  Platform.OS === 'web' && styles.webInput,
                ]}
                value={query}
              />
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
      <LocationUnavailableNotice message={locationNotice} onClose={() => setLocationNotice(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: uiColors.ink,
    fontSize: uiType.sectionHeading,
    fontWeight: '600',
    marginBottom: 8,
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
  webInput: { outlineColor: 'transparent', outlineStyle: 'solid', outlineWidth: 0 },
  locationButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    width: '100%',
  },
  locationButtonPressed: { opacity: 0.6 },
  locationMethods: {
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
    borderColor: uiColors.line,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  locationOption: { minHeight: 48 },
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
    borderColor: uiColors.line,
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
    color: uiColors.ink,
    fontSize: 14,
  },
  or: {
    color: uiColors.muted,
    fontSize: 12,
    marginHorizontal: 10,
    textAlign: 'center',
  },
  message: {
    color: uiColors.secondary,
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  error: {
    alignSelf: 'center',
    color: uiColors.faint,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
    marginTop: 18,
    maxWidth: 260,
    textAlign: 'center',
  },
});
