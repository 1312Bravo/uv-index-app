import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { SelectedLocation } from '../domain/location/locationTypes';
import { getLocationCoordinates } from '../domain/location/getLocationCoordinates';
import type { TimePlan } from '../domain/outing/timePlan';
import { HourlyUvChart } from '../features/forecast/HourlyUvChart';
import { InfoScreen } from '../features/info/InfoScreen';
import { LocationPicker } from '../features/location/LocationPicker';
import { LocationSummary } from '../features/location/LocationSummary';
import { useLocationTimeZone } from '../features/location/useLocationTimeZone';
import { OutingForecast } from '../features/outing/OutingForecast';
import { TimePlanner } from '../features/planning/TimePlanner';
import { uiColors } from '../ui/visualStyle';
import { TopTabs, type AppPage } from './TopTabs';

export function UvScoutApp() {
  const [location, setLocation] = useState<SelectedLocation | null>(null);
  const [isMapInteracting, setIsMapInteracting] = useState(false);
  const [timePlan, setTimePlan] = useState<TimePlan | null>(null);
  const [page, setPage] = useState<AppPage>('location');
  const coordinates = location ? getLocationCoordinates(location) : null;
  const latitude = coordinates?.latitude;
  const longitude = coordinates?.longitude;
  const {
    timeZone: locationTimeZone,
    unavailable: timeZoneUnavailable,
    updateFromForecast: updateLocationTimeZone,
  } = useLocationTimeZone(latitude, longitude);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!isMapInteracting}
      >
        <View style={styles.header}>
          <Text style={styles.title}>UV Scout</Text>
          <Text style={styles.subtitle}>Plan your time outside based on the UV Index.</Text>
        </View>

        <TopTabs activePage={page} hasLocation={location !== null} onSelect={setPage} />

        {page === 'location' && !location && (
          <LocationSummary location={null} timeZone={null} timeZoneUnavailable={false} />
        )}
        {location && page !== 'info' && (
          <LocationSummary
            location={location}
            timeZone={locationTimeZone}
            timeZoneUnavailable={timeZoneUnavailable}
          />
        )}

        <View
          style={page === 'location' ? styles.locationPickerAfterSummary : styles.hidden}
        >
          <LocationPicker
            onMapInteractionChange={setIsMapInteracting}
            onSelect={setLocation}
          />
        </View>

        {page === 'outlook' && latitude !== undefined && longitude !== undefined && (
          <HourlyUvChart
            key={`${latitude},${longitude}`}
            latitude={latitude}
            longitude={longitude}
            onTimezoneChange={updateLocationTimeZone}
          />
        )}
        <View style={page === 'plan' ? undefined : styles.hidden}>
          <TimePlanner onChange={setTimePlan} timeZone={locationTimeZone} />
        </View>
        {page === 'plan' && timePlan && latitude !== undefined && longitude !== undefined && (
          <OutingForecast
            latitude={latitude}
            longitude={longitude}
            onTimezoneChange={updateLocationTimeZone}
            plan={timePlan}
          />
        )}
        {page === 'info' && <InfoScreen />}
      </ScrollView>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: uiColors.white,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingTop: 36,
    paddingBottom: 44,
  },
  header: {
    alignItems: 'center',
    marginBottom: 0,
  },
  hidden: {
    display: 'none',
  },
  locationPickerAfterSummary: {
    marginTop: 24,
  },
  title: {
    color: uiColors.ink,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: uiColors.secondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
