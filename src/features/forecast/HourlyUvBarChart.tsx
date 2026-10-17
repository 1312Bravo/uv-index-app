import { useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { DaylightEvents } from '../../domain/daylight/daylightTypes';
import type { ForecastHour } from '../../domain/forecast/forecastTypes';
import { DaylightTrack, DAYLIGHT_TRACK_HEIGHT } from './DaylightTrack';
import { HourBin, formatChartDay } from './HourBin';
import { BIN_WIDTH, type SelectedRange } from './hourlyChartLayout';

type Props = {
  hours: ForecastHour[];
  timezone: string;
  daylight: DaylightEvents[];
  sunTime: number;
  initialScrollHours?: number;
  selectedRange?: SelectedRange;
};

const BIN_GAP = 0;
const OUTING_CONTEXT_HOURS = 3;
const OUTLOOK_PAST_HOURS = 5;
const OUTLOOK_FUTURE_HOURS = 18;

function getChartHours(hours: ForecastHour[], selectedRange?: SelectedRange): ForecastHour[] {
  if (!selectedRange) {
    const currentIndex = hours.findIndex((hour) => hour.period === 'now');
    if (currentIndex < 0) return hours;
    return hours.slice(
      Math.max(0, currentIndex - OUTLOOK_PAST_HOURS),
      Math.min(hours.length, currentIndex + OUTLOOK_FUTURE_HOURS + 1),
    );
  }

  const selectedIndices = hours.flatMap((hour, index) =>
    hour.time < selectedRange.end && hour.time + 3600 > selectedRange.start ? [index] : [],
  );
  if (selectedIndices.length === 0) return hours;

  const firstSelected = selectedIndices[0];
  const lastSelected = selectedIndices[selectedIndices.length - 1];
  const contextHours = Math.min(
    OUTING_CONTEXT_HOURS,
    firstSelected,
    hours.length - lastSelected - 1,
  );
  return hours.slice(firstSelected - contextHours, lastSelected + contextHours + 1);
}

export function HourlyUvBarChart({ hours, timezone, daylight, sunTime, initialScrollHours = 0, selectedRange }: Props) {
  const chartRef = useRef<ScrollView | null>(null);
  const chartHours = getChartHours(hours, selectedRange);
  const scale = Math.max(8, ...chartHours.map((hour) => hour.uv));

  return (
    <View style={styles.chartFrame}>
      <ScrollView
        ref={chartRef}
        horizontal
        contentContainerStyle={styles.chartContent}
        onContentSizeChange={() => {
          if (initialScrollHours > 0) {
            chartRef.current?.scrollTo({ x: initialScrollHours * BIN_WIDTH, animated: false });
          }
        }}
        showsHorizontalScrollIndicator
        style={styles.chart}
      >
        <View>
          <DaylightTrack hours={chartHours} timezone={timezone} daylight={daylight} sunTime={sunTime} />
          <View style={styles.legendSpace} />
          <View style={styles.bins}>
            {chartHours.map((hour, index) => {
              const day = formatChartDay(hour.time, timezone);
              const previousDay = index > 0 ? formatChartDay(chartHours[index - 1].time, timezone) : null;
              return (
                <HourBin
                  key={hour.time}
                  hour={hour}
                  timezone={timezone}
                  scale={scale}
                  showDay={index === 0 || day !== previousDay}
                  selectedRange={selectedRange}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
      <Text pointerEvents="none" style={styles.topLegend}>Cloud cover (%), temperature (°C)</Text>
      <Text style={styles.bottomLegend}>Rain chance (%), precipitation (mm), wind (km/h)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chartFrame: { position: 'relative' },
  topLegend: {
    backgroundColor: '#FFFFFF', color: '#777777', fontSize: 10, left: 0,
    lineHeight: 14, position: 'absolute', right: 0, textAlign: 'center',
    top: DAYLIGHT_TRACK_HEIGHT + 12, zIndex: 1,
  },
  chart: { marginTop: 10 },
  chartContent: { flexGrow: 1, justifyContent: 'center', paddingBottom: 14 },
  legendSpace: { height: 22 },
  bins: { alignItems: 'flex-end', flexDirection: 'row', gap: BIN_GAP },
  bottomLegend: { color: '#777777', fontSize: 10, marginTop: 6, textAlign: 'center' },
});
