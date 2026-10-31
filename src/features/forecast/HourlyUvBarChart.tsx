import { useEffect, useMemo, useRef } from 'react';
import { Platform, ScrollView, StyleSheet, Text, type ScrollViewInstance, useWindowDimensions, View } from 'react-native';

import type { DaylightEvents } from '../../domain/daylight/daylightTypes';
import type { ForecastHour } from '../../domain/forecast/forecastTypes';
import { uiColors } from '../../ui/visualStyle';
import { DaylightTrack, DAYLIGHT_TRACK_HEIGHT } from './DaylightTrack';
import { getValueGroupTop, HourBin, formatChartDay } from './HourBin';
import { DESKTOP_CHART_LAYOUT, PHONE_CHART_LAYOUT, type SelectedRange } from './hourlyChartLayout';

type Props = {
  hours: ForecastHour[];
  timezone: string;
  daylight: DaylightEvents[];
  sunTime: number;
  initialScrollHours?: number;
  selectedRange?: SelectedRange;
  showFullOutlook?: boolean;
  useHourlyForecast?: boolean;
  selectedHourTime?: number;
  scrollTarget?: { time: number };
};

const BIN_GAP = 0;
const OUTING_CONTEXT_HOURS = 1;
const OUTLOOK_PAST_HOURS = 1;
const OUTLOOK_FUTURE_HOURS = 18;
const CHART_TOP_MARGIN = 10;
const TOP_LEGEND_LINE_HEIGHT = 12;
const TOP_LEGEND_VALUE_GAP = 13;
const LEGEND_SPACE_HEIGHT = 13;

function getChartHours(hours: ForecastHour[], selectedRange?: SelectedRange, showFullOutlook = false): ForecastHour[] {
  if (!selectedRange) {
    const currentIndex = hours.findIndex((hour) => hour.period === 'now');
    if (currentIndex < 0) return hours;
    if (showFullOutlook) return hours.slice(Math.max(0, currentIndex - 1));
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
  return hours.slice(Math.max(0, firstSelected - OUTING_CONTEXT_HOURS));
}

export function HourlyUvBarChart({
  hours, timezone, daylight, sunTime, initialScrollHours = 0, selectedRange,
  showFullOutlook = false, useHourlyForecast = false, selectedHourTime, scrollTarget,
}: Props) {
  const { width } = useWindowDimensions();
  const layout = Platform.OS === 'web' && width >= 760 ? DESKTOP_CHART_LAYOUT : PHONE_CHART_LAYOUT;
  const { binWidth } = layout;
  const chartRef = useRef<ScrollViewInstance | null>(null);
  const chartHours = useMemo(
    () => getChartHours(hours, selectedRange, showFullOutlook),
    [hours, selectedRange, showFullOutlook],
  );
  // Outing columns represent forward hours, so take UV from that interval's endpoint.
  const uvValues = chartHours.map((hour, index) => {
    const nextHour = chartHours[index + 1];
    if (selectedRange && nextHour?.time === hour.time + 3600) {
      return nextHour.hourlyUv ?? nextHour.uv;
    }
    return useHourlyForecast ? hour.hourlyUv ?? hour.uv : hour.uv;
  });
  const scale = Math.max(8, ...uvValues);
  const highestValueGroupTop = chartHours.length === 0 ? 0 : Math.min(...chartHours.map((_, index) =>
    getValueGroupTop(uvValues[index], scale, layout),
  ));
  const topLegendTop = CHART_TOP_MARGIN + DAYLIGHT_TRACK_HEIGHT + LEGEND_SPACE_HEIGHT +
    highestValueGroupTop - TOP_LEGEND_LINE_HEIGHT - TOP_LEGEND_VALUE_GAP;
  const selectedHours = selectedRange
    ? chartHours.filter((hour) => hour.time < selectedRange.end && hour.time + 3600 > selectedRange.start)
    : [];
  const firstSelectedTime = selectedHours[0]?.time;
  const lastSelectedHour = selectedHours.at(-1);
  const endBoundaryTime = lastSelectedHour ? lastSelectedHour.time + 3600 : null;

  useEffect(() => {
    if (scrollTarget === undefined) return;
    const index = chartHours.findIndex((hour) => hour.time === scrollTarget.time);
    if (index < 0) return;
    chartRef.current?.scrollTo({ x: Math.max(0, (index - 3) * binWidth), animated: true });
  }, [binWidth, chartHours, scrollTarget]);

  return (
    <View style={styles.chartFrame}>
      <ScrollView
        ref={chartRef}
        horizontal
        contentContainerStyle={styles.chartContent}
        onContentSizeChange={() => {
          const targetTime = scrollTarget?.time ?? selectedHourTime;
          if (targetTime !== undefined) {
            const index = chartHours.findIndex((hour) => hour.time === targetTime);
            if (index >= 0) chartRef.current?.scrollTo({ x: Math.max(0, (index - 3) * binWidth), animated: false });
          } else if (initialScrollHours > 0) {
            chartRef.current?.scrollTo({ x: initialScrollHours * binWidth, animated: false });
          }
        }}
        showsHorizontalScrollIndicator
        style={styles.chart}
      >
        <View>
          <DaylightTrack hours={chartHours} timezone={timezone} daylight={daylight} sunTime={sunTime} binWidth={binWidth} />
          <View style={styles.legendSpace} />
          <View style={styles.bins}>
            {chartHours.map((hour, index) => {
              const day = formatChartDay(hour.time, timezone);
              const previousDay = index > 0 ? formatChartDay(chartHours[index - 1].time, timezone) : null;
              return (
                <HourBin
                  key={hour.time}
                  hour={hour}
                  layout={layout}
                  valueGroupTop={highestValueGroupTop}
                  timezone={timezone}
                  scale={scale}
                  showDay={index === 0 || day !== previousDay}
                  isEndBoundary={selectedRange !== undefined && hour.time === endBoundaryTime}
                  isFirstSelected={hour.time === firstSelectedTime}
                  isLastSelected={hour.time === lastSelectedHour?.time}
                  selectedRange={selectedRange}
                  selectedHourTime={selectedHourTime}
                  useHourlyForecast={useHourlyForecast}
                  uvValue={uvValues[index]}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
      <Text pointerEvents="none" style={[styles.topLegend, { top: topLegendTop }]}>Cloud cover (%), temperature (°C)</Text>
      <Text style={styles.bottomLegend}>Rain chance (%), precipitation (mm), wind (km/h)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chartFrame: { position: 'relative' },
  topLegend: {
    color: uiColors.muted, fontSize: 11, left: 0,
    lineHeight: TOP_LEGEND_LINE_HEIGHT, position: 'absolute', right: 0, textAlign: 'center',
    zIndex: 1,
  },
  chart: { marginTop: CHART_TOP_MARGIN },
  chartContent: { flexGrow: 1, justifyContent: 'center', paddingBottom: 12 },
  legendSpace: { height: LEGEND_SPACE_HEIGHT },
  bins: { alignItems: 'flex-end', flexDirection: 'row', gap: BIN_GAP },
  bottomLegend: { color: uiColors.muted, fontSize: 11, marginTop: 6, textAlign: 'center' },
});
