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
          <Text style={styles.currentTime}>{formatCurrentDateTime(currentTime, forecast.timezone)}</Text>
          <HourlyUvBarChart
            hours={forecast.hours}
            timezone={forecast.timezone}
            initialScrollOffset={INITIAL_SCROLL_OFFSET}
          />
          <Text style={styles.source}>Open-Meteo forecast data</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 40 },
  heading: { color: '#151515', fontSize: 18, fontWeight: '600' },
  loading: { alignSelf: 'flex-start', marginTop: 20 },
  message: { color: '#9C3D32', fontSize: 14, lineHeight: 20, marginTop: 16 },
  currentTime: { color: '#696969', fontSize: 12, marginTop: 6 },
  source: { color: '#999999', fontSize: 11, marginTop: 10 },
});
