import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ForecastHour } from '../../domain/forecast/forecastTypes';
import { useHourlyForecast } from './useHourlyForecast';

type Props = {
  latitude: number;
  longitude: number;
};

const BIN_WIDTH = 30;
const BIN_GAP = 0;
const INITIAL_SCROLL_OFFSET = (BIN_WIDTH + BIN_GAP) * 2;

function formatHour(time: number, timezone: string): string {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    hour12: true,
    timeZone: timezone,
  }).format(new Date(time * 1000));
}

function formatDay(time: number, timezone: string): string {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: timezone,
  }).format(new Date(time * 1000));
}

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

function HourBin({ hour, timezone, scale, showDay }: {
  hour: ForecastHour;
  timezone: string;
  scale: number;
  showDay: boolean;
}) {
  const height = Math.max(0, hour.uv / scale * 112);
  return (
    <View style={[styles.bin, hour.period === 'now' && styles.currentBin]}>
      <Text style={styles.temperature}>{Math.round(hour.temperature)}°</Text>
      <Text style={styles.uv}>{hour.uv.toFixed(1)}</Text>
      <View style={styles.barArea}>
        <View style={[
          styles.bar,
          { height },
          hour.period === 'past' && styles.pastBar,
          hour.period === 'now' && styles.currentBar,
        ]} />
      </View>
      <Text style={[styles.hour, hour.period === 'now' && styles.currentText]}>
        {hour.period === 'now' ? 'Now' : formatHour(hour.time, timezone)}
      </Text>
      <Text style={styles.day}>{showDay ? formatDay(hour.time, timezone) : ' '}</Text>
    </View>
  );
}

export function HourlyUvChart({ latitude, longitude }: Props) {
  const { forecast, error, loading } = useHourlyForecast(
    latitude,
    longitude,
    'Could not load the UV forecast. Try another location or try again later.',
  );
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const chartRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const scale = forecast ? Math.max(8, ...forecast.hours.map((hour) => hour.uv)) : 8;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>UV Index by hour</Text>
      {loading && <ActivityIndicator color="#151515" style={styles.loading} />}
      {error && <Text style={styles.message}>{error}</Text>}
      {forecast && (
        <>
          <Text style={styles.currentTime}>{formatCurrentDateTime(currentTime, forecast.timezone)}</Text>
          <ScrollView
            ref={chartRef}
            horizontal
            onContentSizeChange={() => chartRef.current?.scrollTo({ x: INITIAL_SCROLL_OFFSET, animated: false })}
            showsHorizontalScrollIndicator
            style={styles.chart}
          >
            <View style={styles.bins}>
              {forecast.hours.map((hour, index) => {
                const day = formatDay(hour.time, forecast.timezone);
                const previousDay = index > 0
                  ? formatDay(forecast.hours[index - 1].time, forecast.timezone)
                  : null;
                return (
                  <HourBin
                    key={hour.time}
                    hour={hour}
                    timezone={forecast.timezone}
                    scale={scale}
                    showDay={index === 0 || day !== previousDay}
                  />
                );
              })}
            </View>
          </ScrollView>
          <Text style={styles.legend}>Temperature above · UV Index below</Text>
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
  chart: { marginTop: 22 },
  bins: { alignItems: 'flex-end', flexDirection: 'row', gap: BIN_GAP },
  bin: { alignItems: 'center', paddingHorizontal: 1, width: BIN_WIDTH },
  currentBin: { backgroundColor: '#F5F5F5', borderRadius: 5 },
  temperature: { color: '#696969', fontSize: 10, marginBottom: 4 },
  uv: { color: '#151515', fontSize: 11, marginBottom: 3 },
  currentTime: { color: '#696969', fontSize: 12, marginTop: 6 },
  barArea: { borderBottomColor: '#D6D6D6', borderBottomWidth: 1, height: 114, justifyContent: 'flex-end', width: 16 },
  bar: { backgroundColor: '#606060', borderRadius: 3, width: 16 },
  pastBar: { backgroundColor: '#B8B8B8' },
  currentBar: { backgroundColor: '#222222' },
  hour: { color: '#696969', fontSize: 9, marginTop: 6, textAlign: 'center' },
  currentText: { color: '#151515', fontWeight: '600' },
  day: { color: '#999999', fontSize: 8, marginTop: 3, minHeight: 20, textAlign: 'center' },
  legend: { color: '#696969', fontSize: 11, marginTop: 12 },
  source: { color: '#999999', fontSize: 11, marginTop: 10 },
});
