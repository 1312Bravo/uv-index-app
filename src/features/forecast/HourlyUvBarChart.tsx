import { useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ForecastHour } from '../../domain/forecast/forecastTypes';

type Props = {
  hours: ForecastHour[];
  timezone: string;
  initialScrollOffset?: number;
};

const BIN_WIDTH = 30;
const BIN_GAP = 0;

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

function HourBin({ hour, timezone, scale, showDay }: {
  hour: ForecastHour;
  timezone: string;
  scale: number;
  showDay: boolean;
}) {
  const height = Math.max(0, hour.uv / scale * 112);
  return (
    <View style={[styles.bin, hour.period === 'now' && styles.currentBin]}>
      <Text style={styles.cloudCover}>{hour.cloudCover === null ? '—' : `${Math.round(hour.cloudCover)}%`}</Text>
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

export function HourlyUvBarChart({ hours, timezone, initialScrollOffset = 0 }: Props) {
  const chartRef = useRef<ScrollView | null>(null);
  const scale = Math.max(8, ...hours.map((hour) => hour.uv));

  return (
    <>
      <ScrollView
        ref={chartRef}
        horizontal
        onContentSizeChange={() => {
          if (initialScrollOffset > 0) {
            chartRef.current?.scrollTo({ x: initialScrollOffset, animated: false });
          }
        }}
        showsHorizontalScrollIndicator
        style={styles.chart}
      >
        <View style={styles.bins}>
          {hours.map((hour, index) => {
            const day = formatDay(hour.time, timezone);
            const previousDay = index > 0 ? formatDay(hours[index - 1].time, timezone) : null;
            return (
              <HourBin
                key={hour.time}
                hour={hour}
                timezone={timezone}
                scale={scale}
                showDay={index === 0 || day !== previousDay}
              />
            );
          })}
        </View>
      </ScrollView>
      <Text style={styles.legend}>Cloud cover and temperature above · UV Index below</Text>
    </>
  );
}

const styles = StyleSheet.create({
  chart: { marginTop: 22 },
  bins: { alignItems: 'flex-end', flexDirection: 'row', gap: BIN_GAP },
  bin: { alignItems: 'center', paddingHorizontal: 1, width: BIN_WIDTH },
  currentBin: { backgroundColor: '#F5F5F5', borderRadius: 5 },
  cloudCover: { color: '#999999', fontSize: 8, marginBottom: 3 },
  temperature: { color: '#696969', fontSize: 10, marginBottom: 4 },
  uv: { color: '#151515', fontSize: 11, marginBottom: 3 },
  barArea: { borderBottomColor: '#D6D6D6', borderBottomWidth: 1, height: 114, justifyContent: 'flex-end', width: 16 },
  bar: { backgroundColor: '#606060', borderRadius: 3, width: 16 },
  pastBar: { backgroundColor: '#B8B8B8' },
  currentBar: { backgroundColor: '#222222' },
  hour: { color: '#696969', fontSize: 9, marginTop: 6, textAlign: 'center' },
  currentText: { color: '#151515', fontWeight: '600' },
  day: { color: '#999999', fontSize: 8, marginTop: 3, minHeight: 20, textAlign: 'center' },
  legend: { color: '#696969', fontSize: 11, marginTop: 12 },
});
