import { StyleSheet, Text, View } from 'react-native';

import type { DaylightEvents } from '../../domain/daylight/daylightTypes';
import type { ForecastHour } from '../../domain/forecast/forecastTypes';

export const DAYLIGHT_TRACK_HEIGHT = 112;

const HORIZON_Y = 68;
const ARC_HEIGHT = 40;
const ARC_STEPS = 48;

type Props = {
  hours: ForecastHour[];
  timezone: string;
  daylight: DaylightEvents[];
  sunTime: number;
  binWidth: number;
};

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

export function DaylightTrack({ hours, timezone, daylight, sunTime, binWidth }: Props) {
  if (hours.length === 0) return null;

  const start = hours[0].time;
  const end = hours[hours.length - 1].time + 3600;
  const width = hours.length * binWidth;
  const xForTime = (time: number) => (time - start) / 3600 * binWidth;
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
      ? createArcSegments(`day-${day.date}`, day.sunrise, day.sunset, start, end, 'day', xForTime)
      : [];
    const nextDay = orderedDays[index + 1];
    const nightArc = day.sunset !== null && nextDay?.sunrise != null
      ? createArcSegments(`night-${day.date}`, day.sunset, nextDay.sunrise, start, end, 'night', xForTime)
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
    <View pointerEvents="none" style={[styles.daylightTrack, { height: DAYLIGHT_TRACK_HEIGHT, width }]}>
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

const styles = StyleSheet.create({
  daylightTrack: { position: 'relative' },
  horizonLine: { backgroundColor: '#E7E7E7', height: 1, position: 'absolute' },
  dayArcSegment: { backgroundColor: '#333333', borderRadius: 2, height: 2, position: 'absolute' },
  nightArcSegment: { backgroundColor: '#9A9A9A', borderRadius: 2, height: 2, position: 'absolute' },
  timeMarker: { backgroundColor: '#777777', opacity: 0.3, position: 'absolute', top: 34, width: 1 },
  eventMarker: { bottom: 0, position: 'absolute', top: 0, width: 1 },
  eventLine: {
    backgroundColor: '#888888', height: 13, left: 0, position: 'absolute',
    top: HORIZON_Y - 6, width: 1,
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
    backgroundColor: '#555555', borderColor: '#FFFFFF', borderRadius: 7, borderWidth: 1,
    height: 14, left: 7, position: 'absolute', top: 7, width: 14,
  },
  moon: { height: 28, position: 'absolute', width: 28 },
  moonDisk: { backgroundColor: '#555555', borderRadius: 11, height: 22, left: 3, position: 'absolute', top: 3, width: 22 },
  moonCutout: { backgroundColor: '#FFFFFF', borderRadius: 10, height: 20, left: 11, position: 'absolute', top: 0, width: 20 },
});
