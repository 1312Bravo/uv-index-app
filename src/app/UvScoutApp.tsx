import { StatusBar } from 'expo-status-bar';
import { Almendra_400Regular } from '@expo-google-fonts/almendra';
import { Fruktur_400Regular, useFonts } from '@expo-google-fonts/fruktur';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

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
  const [fontsLoaded] = useFonts({ Fruktur_400Regular, Almendra_400Regular });
  const { width } = useWindowDimensions();
  const isWideWeb = Platform.OS === 'web' && width >= 760;
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
      <LinearGradient
        colors={[
          'rgba(151, 104, 64, 0)',
          'rgba(151, 104, 64, 0)',
          'rgba(151, 104, 64, 0.04)',
          'rgba(151, 104, 64, 0.12)',
          'rgba(151, 104, 64, 0.04)',
          'rgba(151, 104, 64, 0)',
          'rgba(151, 104, 64, 0)',
          'rgba(151, 104, 64, 0.04)',
          'rgba(151, 104, 64, 0.12)',
          'rgba(151, 104, 64, 0.04)',
          'rgba(151, 104, 64, 0)',
          'rgba(151, 104, 64, 0)',
          'rgba(151, 104, 64, 0.04)',
          'rgba(151, 104, 64, 0.12)',
          'rgba(151, 104, 64, 0.04)',
          'rgba(151, 104, 64, 0)',
          'rgba(151, 104, 64, 0)',
        ]}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.06, 0.1, 0.15, 0.2, 0.24, 0.35, 0.39, 0.44, 0.49, 0.53, 0.65, 0.69, 0.74, 0.79, 0.83, 1]}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={styles.backgroundTexture}
      />
      <ScrollView
        contentContainerStyle={[styles.content, isWideWeb && styles.webContent]}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!isMapInteracting}
      >
        <View style={styles.header}>
          <Text style={[styles.title, fontsLoaded && styles.fruktur]}>
            <Text style={styles.titleAccent}>UV</Text>
            <Text> Scout</Text>
          </Text>
          <Text style={[styles.subtitle, fontsLoaded && styles.almendra]}>
            Plan your time outside based on the UV Index.
          </Text>
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
          <View style={isWideWeb ? styles.webPlanner : undefined}>
            <TimePlanner onChange={setTimePlan} timeZone={locationTimeZone} />
          </View>
          {page === 'plan' && timePlan && latitude !== undefined && longitude !== undefined && (
            <View style={isWideWeb ? styles.webOuting : undefined}>
              <OutingForecast
                latitude={latitude}
                longitude={longitude}
                onTimezoneChange={updateLocationTimeZone}
                plan={timePlan}
              />
            </View>
          )}
        </View>
        {page === 'info' && <InfoScreen />}
      </ScrollView>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: uiColors.page,
  },
  backgroundTexture: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingTop: 36,
    paddingBottom: 44,
  },
  webContent: {
    maxWidth: 1120,
    paddingHorizontal: 32,
    paddingTop: 42,
  },
  webPlanner: { alignSelf: 'center', maxWidth: 600, width: '100%' },
  webOuting: { alignSelf: 'center', maxWidth: 900, width: '100%' },
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
    marginBottom: 8,
    textAlign: 'center',
  },
  titleAccent: { color: uiColors.accent },
  fruktur: { fontFamily: 'Fruktur_400Regular' },
  almendra: { fontFamily: 'Almendra_400Regular' },
  subtitle: {
    color: uiColors.body,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
});
