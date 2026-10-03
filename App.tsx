import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { HourlyUvChart } from './src/features/forecast/HourlyUvChart';
import { LocationPicker, type SelectedLocation } from './src/features/location/LocationPicker';
import { TimePlanner, type TimePlan } from './src/features/planning/TimePlanner';

type Page = 'overview' | 'planner';

export default function App() {
  const [location, setLocation] = useState<SelectedLocation | null>(null);
  const [timePlan, setTimePlan] = useState<TimePlan | null>(null);
  const [page, setPage] = useState<Page>('overview');
  const latitude = location?.source === 'device' ? location.latitude : location?.place.latitude;
  const longitude = location?.source === 'device' ? location.longitude : location?.place.longitude;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>UV Scout</Text>
          <Text style={styles.subtitle}>Plan your time outside based on the UV Index.</Text>
        </View>

        {page === 'overview' ? (
          <>
            <LocationPicker onSelect={(nextLocation) => {
              setLocation(nextLocation);
              setPage('overview');
            }} />
            {latitude !== undefined && longitude !== undefined && (
              <>
                <HourlyUvChart key={`${latitude},${longitude}`} latitude={latitude} longitude={longitude} />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setPage('planner')}
                  style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
                >
                  <Text style={styles.primaryButtonText}>Plan an outing</Text>
                </Pressable>
              </>
            )}
          </>
        ) : (
          <>
            <Pressable accessibilityRole="button" onPress={() => setPage('overview')} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back to overview</Text>
            </Pressable>
            <View style={styles.pageIntro}>
              <Text style={styles.pageTitle}>Plan an outing</Text>
              <Text style={styles.pageSubtitle}>Choose when you expect to be outside.</Text>
            </View>
            <TimePlanner onChange={setTimePlan} />
          </>
        )}
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
    marginBottom: 52,
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  backButtonText: {
    color: '#555555',
    fontSize: 14,
  },
  pageIntro: {
    marginBottom: 4,
  },
  pageTitle: {
    color: '#151515',
    fontSize: 24,
    fontWeight: '600',
  },
  pageSubtitle: {
    color: '#696969',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#151515',
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 32,
    minHeight: 48,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.75,
  },
});
