import { Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import type { OutingUvInterval } from '../../domain/outing/outingUvIntervals';
import { getUvCategory } from '../../domain/uv/getUvCategory';
import { uiColors } from '../../ui/visualStyle';

type Props = {
  hours: OutingUvInterval[];
  timezone: string;
};

const PHONE_BIN_WIDTH = 58;
const PHONE_BAR_WIDTH = 18;
const PHONE_BAR_HEIGHT = 48;
const DESKTOP_BIN_WIDTH = 90;
const DESKTOP_BAR_WIDTH = 32;
const DESKTOP_BAR_HEIGHT = 72;
const PHONE_VALUE_GROUP_HEIGHT = 30;
const DESKTOP_VALUE_GROUP_HEIGHT = 38;
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

export function OutingUvTimeline({ hours, timezone }: Props) {
  const { width } = useWindowDimensions();
  const isWideWeb = Platform.OS === 'web' && width >= 760;
  const binWidth = isWideWeb ? DESKTOP_BIN_WIDTH : PHONE_BIN_WIDTH;
  const barWidth = isWideWeb ? DESKTOP_BAR_WIDTH : PHONE_BAR_WIDTH;
  const barHeight = isWideWeb ? DESKTOP_BAR_HEIGHT : PHONE_BAR_HEIGHT;
  const valueGroupHeight = isWideWeb ? DESKTOP_VALUE_GROUP_HEIGHT : PHONE_VALUE_GROUP_HEIGHT;
  if (hours.length === 0) return null;

  const highestUv = Math.max(...hours.map((hour) => hour.uv));
  const scale = Math.max(8, highestUv);
  const tallestBar = Math.max(2, highestUv / scale * barHeight);
  // Align every label group above the tallest bar while keeping a shared bar baseline.
  const barAreaHeight = tallestBar + valueGroupHeight + VALUE_BAR_GAP + TOP_GAP;
  return (
    <View style={styles.section}>
      <ScrollView
        horizontal
        contentContainerStyle={styles.hours}
        showsHorizontalScrollIndicator
      >
        {hours.map((hour, index) => {
          const { clock, period } = formatReadingTime(hour.sourceTime, timezone);
          const day = formatReadingDay(hour.sourceTime, timezone);
          const previousDay = index > 0 ? formatReadingDay(hours[index - 1].sourceTime, timezone) : null;
          const uv = hour.uv;
          const height = Math.max(2, uv / scale * barHeight);
          const startTime = formatReadingTime(hour.time, timezone);
          const startDay = formatReadingDay(hour.time, timezone);
          const category = getUvCategory(uv).label;
          return (
            <View
              accessible
              accessibilityLabel={`${startDay}, ${startTime.clock} ${startTime.period} to ${day !== startDay ? `${day}, ` : ''}${clock} ${period}. Hourly mean UV Index ${uv.toFixed(1)}, ${category}.`}
              accessibilityRole="text"
              key={hour.time}
              style={[styles.bin, { width: binWidth }]}
            >
              <View style={[styles.barArea, { height: barAreaHeight, width: barWidth }]}>
                <View style={[styles.valueGroup, {
                  bottom: tallestBar + VALUE_BAR_GAP,
                  height: valueGroupHeight,
                  left: (barWidth - binWidth) / 2,
                  width: binWidth,
                }]}>
                  <Text style={[styles.category, isWideWeb && styles.desktopCategory]} numberOfLines={1}>{category}</Text>
                  <Text style={[styles.uvValue, isWideWeb && styles.desktopUvValue]}>{uv.toFixed(1)}</Text>
                </View>
                <View style={[styles.bar, { height, width: barWidth }]} />
              </View>
              <Text style={[styles.clock, isWideWeb && styles.desktopClock]}>{clock}</Text>
              <Text style={[styles.period, isWideWeb && styles.desktopPeriod]}>{period}</Text>
              <Text style={[styles.day, { width: binWidth }]}>
                  {index === 0 || day !== previousDay ? formatWeekday(hour.sourceTime, timezone) : ' '}
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
  bin: { alignItems: 'center' },
  barArea: {
    borderBottomColor: uiColors.line, borderBottomWidth: 1,
    justifyContent: 'flex-end',
  },
  valueGroup: { alignItems: 'center', position: 'absolute' },
  category: { color: uiColors.accent, fontSize: 10, lineHeight: 12, textAlign: 'center' },
  desktopCategory: { fontSize: 11, lineHeight: 14 },
  uvValue: { color: uiColors.accent, fontSize: 16, fontWeight: '500', lineHeight: 18, textAlign: 'center' },
  desktopUvValue: { fontSize: 18, lineHeight: 20 },
  bar: { backgroundColor: uiColors.bar, borderRadius: 3 },
  clock: { color: uiColors.secondary, fontSize: 11, marginTop: 5, textAlign: 'center' },
  desktopClock: { fontSize: 12 },
  period: { color: uiColors.muted, fontSize: 10, textAlign: 'center' },
  desktopPeriod: { fontSize: 11 },
  day: { color: uiColors.muted, fontSize: 9, marginTop: 3, minHeight: 13, textAlign: 'center' },
});
