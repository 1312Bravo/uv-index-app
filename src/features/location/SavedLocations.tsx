import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { SelectedLocation } from '../../domain/location/locationTypes';
import { uiColors } from '../../ui/visualStyle';
import { formatLocationCoordinates, getLocationName } from './formatLocation';
import { LocationActionLabel } from './LocationActionLabel';
import { getSavedLocationId } from './useSavedLocations';

type Props = {
  onSelect: (location: SelectedLocation) => void;
  onRemove: (location: SelectedLocation) => void;
  locations: SelectedLocation[];
  isLoaded: boolean;
};

export function SavedLocations({ isLoaded, locations, onRemove, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.section}>
      {Platform.OS === 'web' ? (
        <button
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          style={{
            alignItems: 'center',
            background: 'transparent',
            border: 0,
            color: uiColors.ink,
            cursor: 'pointer',
            display: 'flex',
            fontFamily: 'system-ui, sans-serif',
            fontSize: 15,
            fontWeight: 400,
            justifyContent: 'center',
            minHeight: 48,
            padding: 8,
            position: 'relative',
            width: '100%',
          }}
          type="button"
        >
          <LocationActionLabel label="Saved locations" />
          <span
            aria-hidden="true"
            style={{
              color: uiColors.ink,
              fontSize: 19,
              lineHeight: '22px',
              position: 'absolute',
              right: 12,
            }}
          >
            {isOpen ? '⌃' : '⌄'}
          </span>
        </button>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: isOpen }}
          onPress={() => setIsOpen((open) => !open)}
          style={({ pressed }) => [styles.savedButton, pressed && styles.pressed]}
        >
          <LocationActionLabel label="Saved locations" />
          <Text style={styles.savedButtonIcon}>{isOpen ? '⌃' : '⌄'}</Text>
        </Pressable>
      )}

      {isOpen && (
        <View style={styles.body}>
          <View style={styles.bodyDivider} />
          {locations.length === 0 && (
            <Text style={styles.empty}>
              {!isLoaded
                ? 'Loading saved locations…'
                : 'Saved locations will appear here.'}
            </Text>
          )}

          {locations.map((location, index) => (
            <View key={getSavedLocationId(location)}>
              <View style={styles.row}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onSelect(location)}
                  style={({ pressed }) => [styles.selectButton, pressed && styles.pressed]}
                >
                  {location.source === 'place' || location.placeName?.trim() ? (
                    <>
                      <Text numberOfLines={1} style={styles.locationName}>
                        {getLocationName(location)}
                      </Text>
                      <Text style={styles.coordinates}>{formatLocationCoordinates(location)}</Text>
                    </>
                  ) : (
                    <Text style={styles.locationName}>{formatLocationCoordinates(location)}</Text>
                  )}
                </Pressable>
                <Pressable
                  accessibilityLabel={`Remove ${getLocationName(location)} from saved locations`}
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => onRemove(location)}
                  style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
                >
                  <Text style={styles.removeText}>×</Text>
                </Pressable>
              </View>
              {index < locations.length - 1 && <View style={styles.rowDivider} />}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { width: '100%' },
  savedButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 8,
    position: 'relative',
  },
  savedButtonIcon: {
    color: uiColors.ink,
    fontSize: 19,
    lineHeight: 22,
    position: 'absolute',
    right: 12,
  },
  body: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  bodyDivider: {
    alignSelf: 'center',
    backgroundColor: uiColors.line,
    height: 1,
    marginBottom: 4,
    width: 48,
  },
  empty: {
    color: uiColors.muted,
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 5,
    paddingVertical: 10,
    textAlign: 'center',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 4,
  },
  rowDivider: {
    alignSelf: 'center',
    backgroundColor: uiColors.line,
    height: 1,
    marginVertical: 3,
    width: 48,
  },
  selectButton: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 42,
  },
  locationName: {
    color: uiColors.ink,
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  coordinates: {
    color: uiColors.muted,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  removeButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 36,
  },
  removeText: {
    color: uiColors.ink,
    fontSize: 21,
    lineHeight: 24,
  },
  pressed: { opacity: 0.65 },
});
