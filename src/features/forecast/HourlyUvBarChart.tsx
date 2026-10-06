import { useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { DaylightEvents } from '../../domain/daylight/daylightTypes';
import type { ForecastHour } from '../../domain/forecast/forecastTypes';

type Props = {
  hours: ForecastHour[];
  timezone: string;
  daylight: DaylightEvents[];
  sunTime: number;
  initialScrollHours?: number;
  selectedRange?: SelectedRange;
};

const BIN_WIDTH = 42;
const BIN_GAP = 0;
const BAR_WIDTH = 16;
const BAR_AREA_HEIGHT = 78;
const MAX_BAR_HEIGHT = 58;
const TRACK_HEIGHT = 112;
const HORIZON_Y = 68;
const ARC_HEIGHT = 26;
const ARC_STEPS = 48;
const OUTING_CONTEXT_HOURS = 3;

type SelectedRange = { start: number; end: number };

function getChartHours(hours: ForecastHour[], selectedRange?: SelectedRange): ForecastHour[] {
  if (!selectedRange) return hours;

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
    timeZone: timezone,
  }).format(new Date(time * 1000));
}

function formatEventTime(time: number, timezone: string): string {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(new Date(time * 1000));
}

function createArcSegments(
  keyPrefix: string,
  intervalStart: number,
  intervalEnd: number,
  chartStart: number,
  chartEnd: number,
  side: 'day' | 'night',
  xForTime: (time: number) => number,
) {
  if (intervalEnd <= intervalStart) return [];

  const visibleStart = Math.max(chartStart, intervalStart);
  const visibleEnd = Math.min(chartEnd, intervalEnd);
  if (visibleEnd <= visibleStart) return [];

  const points = Array.from({ length: ARC_STEPS + 1 }, (_, index) => {
    const time = intervalStart + (intervalEnd - intervalStart) * index / ARC_STEPS;
    const progress = (time - intervalStart) / (intervalEnd - intervalStart);
    const direction = side === 'day' ? -1 : 1;
    return {
      time,
      x: xForTime(time),
      y: HORIZON_Y + direction * Math.sin(progress * Math.PI) * ARC_HEIGHT,
    };
  });

  return points.slice(1).flatMap((point, index) => {
    if (index % 2 !== 0) return [];

    const previous = points[index];
    if (point.time < chartStart || previous.time > chartEnd) return [];
    const dx = point.x - previous.x;
    const dy = point.y - previous.y;
    const length = Math.hypot(dx, dy);

    return [{
      key: `${keyPrefix}-${index}`,
      left: (point.x + previous.x) / 2 - length / 2,
      top: (point.y + previous.y) / 2 - 1,
      width: length,
      angle: `${Math.atan2(dy, dx) * 180 / Math.PI}deg`,
      side,
    }];
  });
}

function DaylightTrack({ hours, timezone, daylight, sunTime }: {
  hours: ForecastHour[];
  timezone: string;
  daylight: DaylightEvents[];
  sunTime: number;
}) {
  if (hours.length === 0) return null;

  const start = hours[0].time;
  const end = hours[hours.length - 1].time + 3600;
  const width = hours.length * BIN_WIDTH;
  const xForTime = (time: number) => (time - start) / 3600 * BIN_WIDTH;
  const orderedDays = [...daylight].sort((a, b) => a.date.localeCompare(b.date));
  const events = orderedDays.flatMap((day) => ([
    { label: 'Dawn', time: day.civilDawn },
    { label: 'Sunrise', time: day.sunrise },
    { label: 'Sunset', time: day.sunset },
    { label: 'Dusk', time: day.civilDusk },
  ]).filter((event): event is { label: string; time: number } =>
    event.time !== null && event.time >= start && event.time <= end
  )).sort((a, b) => a.time - b.time);
  const arcSegments = orderedDays.flatMap((day, index) => {
    const dayArc = day.sunrise !== null && day.sunset !== null
      ? createArcSegments(
        `day-${day.date}`,
        day.sunrise,
        day.sunset,
        start,
        end,
        'day',
        xForTime,
      )
      : [];
    const nextDay = orderedDays[index + 1];
    const nightArc = day.sunset !== null && nextDay?.sunrise != null
      ? createArcSegments(
        `night-${day.date}`,
        day.sunset,
        nextDay.sunrise,
        start,
        end,
        'night',
        xForTime,
      )
      : [];
    return [...dayArc, ...nightArc];
  });
  const sunX = xForTime(sunTime);
  const selectedDay = orderedDays.find((day) =>
    day.sunrise !== null && day.sunset !== null && sunTime >= day.sunrise && sunTime < day.sunset,
  );
  const selectedNightIndex = orderedDays.slice(0, -1).findIndex((day, index) => {
    const nextSunrise = orderedDays[index + 1]?.sunrise;
    return day.sunset !== null && nextSunrise != null &&
      sunTime >= day.sunset && sunTime < nextSunrise;
  });
  const sunPosition = selectedDay?.sunrise !== null && selectedDay?.sunrise !== undefined && selectedDay.sunset !== null
    ? {
      x: sunX,
      y: HORIZON_Y - Math.sin((sunTime - selectedDay.sunrise) / (selectedDay.sunset - selectedDay.sunrise) * Math.PI) * ARC_HEIGHT,
    }
    : null;
  const nightStart = selectedNightIndex >= 0 ? orderedDays[selectedNightIndex].sunset : null;
  const nightEnd = selectedNightIndex >= 0 ? orderedDays[selectedNightIndex + 1]?.sunrise : null;
  const moonPosition = nightStart !== null && nightStart !== undefined && nightEnd != null
    ? {
      x: sunX,
      y: HORIZON_Y + Math.sin((sunTime - nightStart) / (nightEnd - nightStart) * Math.PI) * ARC_HEIGHT,
    }
    : null;

  return (
    <View pointerEvents="none" style={[styles.daylightTrack, { height: TRACK_HEIGHT, width }]}>
      <View style={[styles.horizonLine, { left: 0, top: HORIZON_Y, width }]} />
      {arcSegments.map((segment) => (
        <View
          key={segment.key}
          style={[segment.side === 'day' ? styles.dayArcSegment : styles.nightArcSegment, {
            left: segment.left,
            top: segment.top,
            transform: [{ rotate: segment.angle }],
            width: segment.width,
          }]}
        />
      ))}
      {sunX >= 0 && sunX <= width && (
        <View style={[styles.timeMarker, { left: sunX, height: HORIZON_Y - 22 }]} />
      )}
      {events.map((event, index) => {
        const x = xForTime(event.time);
        const labelLeft = Math.min(Math.max(x - 36, 0), Math.max(0, width - 72));
        return (
          <View key={`${event.label}-${event.time}`} style={[styles.eventMarker, { left: x - 1 }]}>
            <View style={styles.eventLine} />
            <Text style={[styles.eventLabel, { left: labelLeft - x, top: index % 2 === 0 ? 0 : 18 }]}>
              {event.label} {formatEventTime(event.time, timezone)}
            </Text>
          </View>
        );
      })}
      {sunPosition !== null && sunX >= 0 && sunX <= width && (
        <View style={[styles.sun, {
          left: Math.min(Math.max(sunPosition.x - 14, 0), Math.max(0, width - 28)),
          top: sunPosition.y - 14,
        }]}>
          <View style={[styles.sunRay, styles.sunRayTop]} />
          <View style={[styles.sunRay, styles.sunRayTopRight]} />
          <View style={[styles.sunRay, styles.sunRayRight]} />
          <View style={[styles.sunRay, styles.sunRayBottomRight]} />
          <View style={[styles.sunRay, styles.sunRayBottom]} />
          <View style={[styles.sunRay, styles.sunRayBottomLeft]} />
          <View style={[styles.sunRay, styles.sunRayLeft]} />
          <View style={[styles.sunRay, styles.sunRayTopLeft]} />
          <View style={styles.sunDisk} />
        </View>
      )}
      {moonPosition !== null && sunX >= 0 && sunX <= width && (
        <View style={[styles.moon, {
          left: Math.min(Math.max(moonPosition.x - 14, 0), Math.max(0, width - 28)),
          top: moonPosition.y - 14,
        }]}>
          <View style={styles.moonDisk} />
          <View style={styles.moonCutout} />
        </View>
      )}
    </View>
  );
}

function HourBin({ hour, timezone, scale, showDay, selectedRange }: {
  hour: ForecastHour;
  timezone: string;
  scale: number;
  showDay: boolean;
  selectedRange?: SelectedRange;
}) {
  const height = Math.max(0, hour.uv / scale * MAX_BAR_HEIGHT);
  const isSelected = selectedRange !== undefined &&
    hour.time < selectedRange.end && hour.time + 3600 > selectedRange.start;
  const isContext = selectedRange !== undefined && !isSelected;
  const cloudCoverDescription = hour.cloudCover === null
    ? 'unavailable'
    : `${Math.round(hour.cloudCover)} percent`;
  const outingDescription = selectedRange
    ? isSelected ? ', during selected outing' : ', outside selected outing'
    : '';
  return (
    <View style={[
      styles.bin,
      selectedRange
        ? isSelected && styles.selectedBin
        : hour.period === 'now' && styles.currentBin,
    ]}
      accessible
      accessibilityLabel={`${formatHour(hour.time, timezone)}. UV Index ${hour.uv.toFixed(1)}. Temperature ${Math.round(hour.temperature)} degrees Celsius. Cloud cover ${cloudCoverDescription}${outingDescription}.`}
      accessibilityRole="text"
    >
      <Text numberOfLines={1} style={[styles.cloudCover, isContext && styles.contextText]}>
        {hour.cloudCover === null ? '—' : `${Math.round(hour.cloudCover)}%`}
      </Text>
      <Text numberOfLines={1} style={[styles.temperature, isContext && styles.contextText]}>
        {Math.round(hour.temperature)}°
      </Text>
      <View style={styles.barArea}>
        <Text
          numberOfLines={1}
          style={[styles.uv, isContext && styles.contextText, { bottom: height + 2 }]}
        >
          {hour.uv.toFixed(1)}
        </Text>
        <View style={[
          styles.bar,
          { height },
          selectedRange
            ? isSelected ? styles.selectedBar : styles.contextBar
            : hour.period === 'past' ? styles.pastBar : hour.period === 'now' ? styles.currentBar : null,
        ]} />
      </View>
      <Text
        numberOfLines={1}
        style={[styles.hour, !selectedRange && hour.period === 'now' && styles.currentText, isContext && styles.contextText]}
      >
        {hour.period === 'now' ? 'Now' : formatHour(hour.time, timezone)}
      </Text>
      <Text numberOfLines={1} style={[styles.day, isContext && styles.contextText]}>
        {showDay ? formatDay(hour.time, timezone) : ' '}
      </Text>
    </View>
  );
}

export function HourlyUvBarChart({ hours, timezone, daylight, sunTime, initialScrollHours = 0, selectedRange }: Props) {
  const chartRef = useRef<ScrollView | null>(null);
  const chartHours = getChartHours(hours, selectedRange);
  const scale = Math.max(8, ...chartHours.map((hour) => hour.uv));

  return (
    <>
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
          <View style={styles.bins}>
            {chartHours.map((hour, index) => {
              const day = formatDay(hour.time, timezone);
              const previousDay = index > 0 ? formatDay(chartHours[index - 1].time, timezone) : null;
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
    </>
  );
}

const styles = StyleSheet.create({
  chart: { marginTop: 10 },
  chartContent: { flexGrow: 1, justifyContent: 'center' },
  bins: { alignItems: 'flex-end', flexDirection: 'row', gap: BIN_GAP },
  daylightTrack: { position: 'relative' },
  horizonLine: { backgroundColor: '#E7E7E7', height: 1, position: 'absolute' },
  dayArcSegment: { backgroundColor: '#333333', borderRadius: 2, height: 2, position: 'absolute' },
  nightArcSegment: { backgroundColor: '#9A9A9A', borderRadius: 2, height: 2, position: 'absolute' },
  timeMarker: { backgroundColor: '#777777', opacity: 0.3, position: 'absolute', top: 34, width: 1 },
  eventMarker: { bottom: 0, position: 'absolute', top: 0, width: 1 },
  eventLine: {
    backgroundColor: '#888888',
    height: 13,
    left: 0,
    position: 'absolute',
    top: HORIZON_Y - 6,
    width: 1,
  },
  eventLabel: { color: '#4D4D4D', fontSize: 10, position: 'absolute', textAlign: 'center', width: 72 },
  sun: { height: 28, position: 'absolute', width: 28 },
  sunRay: { backgroundColor: '#555555', borderRadius: 1, height: 5, position: 'absolute', width: 2 },
  sunRayTop: { left: 13, top: 0 },
  sunRayTopRight: { left: 20, top: 3, transform: [{ rotate: '45deg' }] },
  sunRayRight: { left: 26, top: 12, transform: [{ rotate: '90deg' }] },
  sunRayBottomRight: { left: 20, top: 20, transform: [{ rotate: '135deg' }] },
  sunRayBottom: { left: 13, top: 23 },
  sunRayBottomLeft: { left: 5, top: 20, transform: [{ rotate: '45deg' }] },
  sunRayLeft: { left: 0, top: 12, transform: [{ rotate: '90deg' }] },
  sunRayTopLeft: { left: 5, top: 3, transform: [{ rotate: '135deg' }] },
  sunDisk: {
    backgroundColor: '#555555',
    borderColor: '#FFFFFF',
    borderRadius: 7,
    borderWidth: 1,
    height: 14,
    left: 7,
    position: 'absolute',
    top: 7,
    width: 14,
  },
  moon: { height: 28, position: 'absolute', width: 28 },
  moonDisk: { backgroundColor: '#555555', borderRadius: 11, height: 22, left: 3, position: 'absolute', top: 3, width: 22 },
  moonCutout: { backgroundColor: '#FFFFFF', borderRadius: 10, height: 20, left: 11, position: 'absolute', top: 0, width: 20 },
  bin: { alignItems: 'center', paddingHorizontal: 1, width: BIN_WIDTH },
  currentBin: { backgroundColor: '#F5F5F5', borderRadius: 5 },
  selectedBin: { backgroundColor: '#F5F5F5', borderRadius: 5 },
  cloudCover: { color: '#767676', fontSize: 9, marginBottom: 1 },
  temperature: { color: '#5F5F5F', fontSize: 11, marginBottom: 2 },
  uv: {
    color: '#151515',
    fontSize: 12,
    fontWeight: '500',
    left: (BAR_WIDTH - BIN_WIDTH) / 2,
    position: 'absolute',
    textAlign: 'center',
    width: BIN_WIDTH,
  },
  barArea: {
    borderBottomColor: '#D6D6D6',
    borderBottomWidth: 1,
    height: BAR_AREA_HEIGHT,
    justifyContent: 'flex-end',
    width: BAR_WIDTH,
  },
  bar: { backgroundColor: '#606060', borderRadius: 3, width: BAR_WIDTH },
  pastBar: { backgroundColor: '#999999' },
  currentBar: { backgroundColor: '#222222' },
  selectedBar: { backgroundColor: '#222222' },
  contextBar: { backgroundColor: '#C8C8C8' },
  contextText: { color: '#767676' },
  hour: { color: '#5F5F5F', fontSize: 10, marginTop: 4, textAlign: 'center', width: BIN_WIDTH },
  currentText: { color: '#151515', fontWeight: '600' },
  day: { color: '#767676', fontSize: 9, marginTop: 2, minHeight: 15, textAlign: 'center' },
});
