import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ForecastHour } from '../../domain/forecast/forecastTypes';
import { getUvCategory } from '../../domain/uv/getUvCategory';

type Props = {
  endBoundaryHour?: ForecastHour;
  hours: ForecastHour[];
  timezone: string;
};

const BIN_WIDTH = 58;
const BAR_WIDTH = 18;
const BAR_HEIGHT = 48;
const VALUE_GROUP_HEIGHT = 30;
const VALUE_BAR_GAP = 16;
const TOP_GAP = 12;

function formatReadingTime(time: number, timezone: string) {
  const parts = new Intl.DateTimeFormat('en', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: timezone,
  }).formatToParts(new Date(time * 1000));
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';
  return { clock: `${part('hour')}:${part('minute')}`, period: part('dayPeriod') };
}

function formatReadingDay(time: number, timezone: string): string {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short', month: 'short', day: 'numeric', timeZone: timezone,
  }).format(new Date(time * 1000));
}

function formatWeekday(time: number, timezone: string): string {
  return new Intl.DateTimeFormat('en', { weekday: 'short', timeZone: timezone })
    .format(new Date(time * 1000));
}

export function OutingUvTimeline({ endBoundaryHour, hours, timezone }: Props) {
  if (hours.length === 0) return null;

  const displayHours = endBoundaryHour ? [...hours, endBoundaryHour] : hours;
  const highestUv = Math.max(...displayHours.map(({ uv }) => uv));
  const scale = Math.max(8, highestUv);
  const tallestBar = Math.max(2, highestUv / scale * BAR_HEIGHT);
  // Keep the gap above the tallest value steady without moving the shared bar baseline.
  const barAreaHeight = tallestBar + VALUE_GROUP_HEIGHT + VALUE_BAR_GAP + TOP_GAP;
  return (
    <View style={styles.section}>
      <ScrollView
        horizontal
        contentContainerStyle={styles.hours}
        showsHorizontalScrollIndicator
      >
        {displayHours.map((hour, index) => {
          const { clock, period } = formatReadingTime(hour.time, timezone);
          const day = formatReadingDay(hour.time, timezone);
          const previousDay = index > 0 ? formatReadingDay(displayHours[index - 1].time, timezone) : null;
          const height = Math.max(2, hour.uv / scale * BAR_HEIGHT);
          const endTime = formatReadingTime(hour.time + 3600, timezone);
          const category = getUvCategory(hour.uv).label;
          return (
            <View
              accessible
              accessibilityLabel={`${day}, ${clock} ${period} to ${endTime.clock} ${endTime.period}. UV Index ${hour.uv.toFixed(1)}, ${category}.`}
              accessibilityRole="text"
              key={hour.time}
              style={styles.bin}
            >
              <View style={[styles.barArea, { height: barAreaHeight }]}>
                <View style={[styles.valueGroup, { bottom: height + VALUE_BAR_GAP }]}>
                  <Text style={styles.category} numberOfLines={1}>{category}</Text>
                  <Text style={styles.uvValue}>{hour.uv.toFixed(1)}</Text>
                </View>
                <View style={[styles.bar, { height }]} />
              </View>
              <Text style={styles.clock}>{clock}</Text>
              <Text style={styles.period}>{period}</Text>
              <Text style={styles.day}>
                {index === 0 || day !== previousDay ? formatWeekday(hour.time, timezone) : ' '}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 6 },
  hours: { flexGrow: 1, justifyContent: 'center', paddingBottom: 10 },
  bin: { alignItems: 'center', width: BIN_WIDTH },
  barArea: {
    borderBottomColor: '#D6D6D6', borderBottomWidth: 1,
    justifyContent: 'flex-end', width: BAR_WIDTH,
  },
  valueGroup: { alignItems: 'center', left: -(BIN_WIDTH - BAR_WIDTH) / 2, position: 'absolute', width: BIN_WIDTH },
  category: { color: '#777777', fontSize: 10, lineHeight: 12, textAlign: 'center' },
  uvValue: { color: '#151515', fontSize: 16, fontWeight: '500', lineHeight: 18, textAlign: 'center' },
  bar: { backgroundColor: '#222222', borderRadius: 3, width: BAR_WIDTH },
  clock: { color: '#5F5F5F', fontSize: 11, marginTop: 5, textAlign: 'center' },
  period: { color: '#767676', fontSize: 10, textAlign: 'center' },
  day: { color: '#767676', fontSize: 9, marginTop: 3, minHeight: 13, textAlign: 'center', width: BIN_WIDTH },
});
