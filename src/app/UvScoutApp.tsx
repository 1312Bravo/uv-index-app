import { StatusBar } from 'expo-status-bar';
import { Almendra_400Regular } from '@expo-google-fonts/almendra';
import { Fruktur_400Regular, useFonts } from '@expo-google-fonts/fruktur';
import { useCallback, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import type { SelectedLocation } from '../domain/location/locationTypes';
import type { LocationCoordinates } from '../domain/location/locationTypes';
import { getLocationCoordinates } from '../domain/location/getLocationCoordinates';
import type { TimePlan } from '../domain/outing/timePlan';
import { HourlyUvChart } from '../features/forecast/HourlyUvChart';
import { InfoScreen } from '../features/info/InfoScreen';
import { LocationPicker } from '../features/location/LocationPicker';
import { LocationSummary } from '../features/location/LocationSummary';
import { useLocationTimeZone } from '../features/location/useLocationTimeZone';
import { OutingForecast } from '../features/outing/OutingForecast';
import { TimePlanner, type ChartSelectedTimeRange } from '../features/planning/TimePlanner';
import { uiColors } from '../ui/visualStyle';
import { TopTabs, type AppPage } from './TopTabs';

type PendingOutingChartStart = {
  hourTime: number;
  startsNow: boolean;
};

export function UvScoutApp() {
  const [fontsLoaded] = useFonts({ Fruktur_400Regular, Almendra_400Regular });
  const { width } = useWindowDimensions();
  const isWideWeb = Platform.OS === 'web' && width >= 760;
  const [location, setLocation] = useState<SelectedLocation | null>(null);
  const [forecastPoint, setForecastPoint] = useState<LocationCoordinates | null>(null);
  const [isMapInteracting, setIsMapInteracting] = useState(false);
  const [timePlan, setTimePlan] = useState<TimePlan | null>(null);
  const [chartSelection, setChartSelection] = useState<ChartSelectedTimeRange | null>(null);
  const [pendingChartStart, setPendingChartStart] = useState<PendingOutingChartStart | null>(null);
  const [page, setPage] = useState<AppPage>('location');
  const coordinates = location ? getLocationCoordinates(location) : null;
  const latitude = coordinates?.latitude;
  const longitude = coordinates?.longitude;
  const handleForecastPointChange = useCallback((point: LocationCoordinates | null) => {
    setForecastPoint((current) => current?.latitude === point?.latitude &&
      current?.longitude === point?.longitude ? current : point);
  }, []);
  const {
    timeZone: locationTimeZone,
    unavailable: timeZoneUnavailable,
    updateFromForecast: updateLocationTimeZone,
  } = useLocationTimeZone(latitude, longitude);

  function handleOutingChartHour(time: number, isCurrentHour: boolean) {
    if (!pendingChartStart) {
      setPendingChartStart({ hourTime: time, startsNow: isCurrentHour });
      return;
    }

    if (time === pendingChartStart.hourTime) {
      setPendingChartStart(null);
      return;
    }

    if (isCurrentHour) return;

    const startTime = pendingChartStart.startsNow
      ? Date.now() / 1000
      : pendingChartStart.hourTime;
    if (time <= startTime) return;

    setChartSelection({
      start: pendingChartStart.startsNow ? null : new Date(startTime * 1000),
      end: new Date(time * 1000),
    });
    setPendingChartStart(null);
  }

  function resetChartSelection() {
    setChartSelection(null);
    setPendingChartStart(null);
  }

  return (
    <View style={styles.screen}>
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
          <LocationSummary location={null} timeZone={null} timeZoneUnavailable={false} forecastPoint={null} />
        )}
        {location && page !== 'info' && (
          <LocationSummary
            forecastPoint={forecastPoint}
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
            onSelect={(selectedLocation) => {
              const nextCoordinates = selectedLocation ? getLocationCoordinates(selectedLocation) : null;
              const sameSelectedCoordinates = coordinates && nextCoordinates &&
                coordinates.latitude === nextCoordinates.latitude &&
                coordinates.longitude === nextCoordinates.longitude;
              setLocation(selectedLocation);
              if (!sameSelectedCoordinates) setForecastPoint(null);
              setChartSelection(null);
              setPendingChartStart(null);
            }}
          />
        </View>

        {page === 'outlook' && latitude !== undefined && longitude !== undefined && (
          <HourlyUvChart
            key={`${latitude},${longitude}`}
            latitude={latitude}
            longitude={longitude}
            onTimezoneChange={updateLocationTimeZone}
            onForecastPointChange={handleForecastPointChange}
          />
        )}
        <View style={page === 'plan' ? undefined : styles.hidden}>
          <View style={isWideWeb ? styles.webPlanner : undefined}>
            <TimePlanner
              chartSelection={chartSelection}
              onChange={setTimePlan}
              onReset={resetChartSelection}
              timeZone={locationTimeZone}
            />
          </View>
          {page === 'plan' && timePlan && latitude !== undefined && longitude !== undefined && (
            <View style={isWideWeb ? styles.webOuting : undefined}>
              <OutingForecast
                latitude={latitude}
                longitude={longitude}
                onTimezoneChange={updateLocationTimeZone}
                onForecastPointChange={handleForecastPointChange}
                plan={timePlan}
                pendingChartStart={pendingChartStart}
                onChartHourSelect={handleOutingChartHour}
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
