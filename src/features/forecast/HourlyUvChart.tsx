import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { getCurrentUvGuidance } from '../../domain/guidance/getCurrentUvGuidance';
import { CurrentUvGuidance } from './CurrentUvGuidance';
import { useHourlyForecast } from './useHourlyForecast';
import { HourlyUvBarChart } from './HourlyUvBarChart';

type Props = {
  latitude: number;
  longitude: number;
  onTimezoneChange: (timeZone: string) => void;
};

const INITIAL_SCROLL_HOURS = 2;

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

export function HourlyUvChart({ latitude, longitude, onTimezoneChange }: Props) {
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const refreshSlot = Math.floor(currentTime / (15 * 60_000));
  const { forecast, error, loading } = useHourlyForecast(
    latitude,
    longitude,
    'Could not load the UV forecast. Try another location or try again later.',
    refreshSlot,
  );
  const currentHour = forecast?.hours.find((hour) => hour.period === 'now');
  const currentGuidance = currentHour
    ? getCurrentUvGuidance(currentHour.uv, currentHour.cloudCover)
    : null;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (forecast) onTimezoneChange(forecast.timezone);
  }, [forecast, onTimezoneChange]);

  return (
    <View style={styles.section}>
      {loading && <ActivityIndicator color="#151515" style={styles.loading} />}
      {error && <Text style={styles.message}>{error}</Text>}
      {forecast && (
        <>
          {currentGuidance && (
            <CurrentUvGuidance
              guidance={currentGuidance}
              estimateTime={forecast.currentConditionsTime}
              timezone={forecast.timezone}
            />
          )}
          {!currentGuidance && <Text style={styles.message}>Current UV estimate unavailable.</Text>}
          <Text style={styles.heading}>UV &amp; weather by hour</Text>
          <HourlyUvBarChart
            hours={forecast.hours}
            timezone={forecast.timezone}
            daylight={forecast.daylight}
            sunTime={currentTime / 1000}
            initialScrollHours={INITIAL_SCROLL_HOURS}
          />
          <Text style={styles.currentTime}>{formatCurrentDateTime(currentTime, forecast.timezone)}</Text>
          <Text style={styles.source}>Open-Meteo forecast data</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  heading: { color: '#151515', fontSize: 18, fontWeight: '600', marginTop: 24, textAlign: 'center' },
  loading: { alignSelf: 'center', marginTop: 20 },
  message: { color: '#9C3D32', fontSize: 14, lineHeight: 20, marginTop: 16, textAlign: 'center' },
  currentTime: { color: '#444444', fontSize: 13, fontWeight: '500', marginTop: 14, textAlign: 'center' },
  source: { color: '#767676', fontSize: 11, marginTop: 10, textAlign: 'center' },
});
