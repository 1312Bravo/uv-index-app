import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { SelectedLocation } from '../domain/location/locationTypes';
import type { TimePlan } from '../domain/outing/timePlan';
import { HourlyUvChart } from '../features/forecast/HourlyUvChart';
import { InfoScreen } from '../features/info/InfoScreen';
import { LocationPicker } from '../features/location/LocationPicker';
import { OutingForecast } from '../features/outing/OutingForecast';
import { TimePlanner } from '../features/planning/TimePlanner';
import { formatLocationCoordinates, getLocationName } from '../features/location/formatLocation';
import { TopTabs, type AppPage } from './TopTabs';

export function UvScoutApp() {
  const [location, setLocation] = useState<SelectedLocation | null>(null);
  const [timePlan, setTimePlan] = useState<TimePlan | null>(null);
  const [page, setPage] = useState<AppPage>('location');
  const latitude = location?.source === 'device' ? location.latitude : location?.place.latitude;
  const longitude = location?.source === 'device' ? location.longitude : location?.place.longitude;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>UV Scout</Text>
          <Text style={styles.subtitle}>Plan your time outside based on the UV Index.</Text>
        </View>

        <TopTabs activePage={page} hasLocation={location !== null} onSelect={setPage} />

        <View style={page === 'location' ? undefined : styles.hidden}>
          <LocationPicker onSelect={setLocation} />
        </View>

        {location && page !== 'location' && page !== 'info' && (
          <View style={styles.locationContext}>
            <Text style={styles.locationName}>{getLocationName(location)}</Text>
            <Text style={styles.locationCoordinates}>{formatLocationCoordinates(location)}</Text>
          </View>
        )}

        {page === 'outlook' && latitude !== undefined && longitude !== undefined && (
          <HourlyUvChart key={`${latitude},${longitude}`} latitude={latitude} longitude={longitude} />
        )}
        {page === 'plan' && (
          <>
            <TimePlanner onChange={setTimePlan} />
            {timePlan && latitude !== undefined && longitude !== undefined && (
              <OutingForecast latitude={latitude} longitude={longitude} plan={timePlan} />
            )}
          </>
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
    backgroundColor: '#FFFFFF',
  },
  content: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 68,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 0,
  },
  hidden: {
    display: 'none',
  },
  locationContext: {
    borderBottomColor: '#EEEEEE',
    borderBottomWidth: 1,
    marginTop: 24,
    paddingBottom: 12,
  },
  locationName: {
    color: '#151515',
    fontSize: 14,
    fontWeight: '600',
  },
  locationCoordinates: {
    color: '#999999',
    fontSize: 12,
    marginTop: 3,
  },
  title: {
    color: '#151515',
    fontSize: 36,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#696969',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
