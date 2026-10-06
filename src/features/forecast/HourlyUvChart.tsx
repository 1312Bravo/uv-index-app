import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useHourlyForecast } from './useHourlyForecast';
import { HourlyUvBarChart } from './HourlyUvBarChart';

type Props = {
  latitude: number;
  longitude: number;
};

const INITIAL_SCROLL_OFFSET = 60;

function formatCurrentDateTime(time: number, timezone: string): string {
  return new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  }).format(new Date(time));
}

export function HourlyUvChart({ latitude, longitude }: Props) {
  const { forecast, error, loading } = useHourlyForecast(
    latitude,
    longitude,
    'Could not load the UV forecast. Try another location or try again later.',
  );
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>UV Index by hour</Text>
      {loading && <ActivityIndicator color="#151515" style={styles.loading} />}
      {error && <Text style={styles.message}>{error}</Text>}
      {forecast && (
        <>
          <HourlyUvBarChart
            hours={forecast.hours}
            timezone={forecast.timezone}
            daylight={forecast.daylight}
            sunTime={currentTime / 1000}
            initialScrollOffset={INITIAL_SCROLL_OFFSET}
          />
          <Text style={styles.currentTime}>{formatCurrentDateTime(currentTime, forecast.timezone)}</Text>
          <Text style={styles.source}>Open-Meteo forecast data</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 32 },
  heading: { color: '#151515', fontSize: 18, fontWeight: '600', textAlign: 'center' },
  loading: { alignSelf: 'center', marginTop: 20 },
  message: { color: '#9C3D32', fontSize: 14, lineHeight: 20, marginTop: 16, textAlign: 'center' },
  currentTime: { color: '#444444', fontSize: 13, fontWeight: '500', marginTop: 8, textAlign: 'center' },
  source: { color: '#767676', fontSize: 11, marginTop: 10, textAlign: 'center' },
});
