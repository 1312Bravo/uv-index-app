import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getLocalDateKey } from '../../domain/daylight/getDaylightEvents';
import type { ForecastHour } from '../../domain/forecast/forecastTypes';
import { getOutlookTimeSlots } from './getOutlookTimeSlots';

type Props = {
  mode: 'now' | 'custom';
  hours: ForecastHour[];
  nowTime: number;
  onSelectMode: (mode: 'now' | 'custom') => void;
  onSelectHour: (time: number) => void;
  selectedTime: number | null;
  timezone: string;
};

function formatTime(time: number, timezone: string): string {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  }).format(new Date(time * 1000));
}

function formatDateTime(time: number, timezone: string): string {
  return new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  }).format(new Date(time * 1000));
}

export function OutlookTimeSelector({
  mode, hours, nowTime, onSelectMode, onSelectHour, selectedTime, timezone,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const timeSlots = getOutlookTimeSlots(hours, timezone, nowTime);
  const today = getLocalDateKey(nowTime / 1000, timezone);
  const selectedTimeLabel = selectedTime === null
    ? 'Choose a time'
    : formatDateTime(selectedTime, timezone);

  return (
    <View style={styles.section}>
      <View style={styles.modeChoices}>
        {(['now', 'custom'] as const).map((choice) => {
          const active = mode === choice;
          return (
            <Pressable
              key={choice}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => {
                setExpanded(false);
                onSelectMode(choice);
              }}
              style={[styles.modeChoice, active && styles.selectedModeChoice]}
            >
              <Text style={[styles.modeText, active && styles.selectedModeText]}>
                {choice === 'now' ? 'Now' : 'Custom time'}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {mode === 'custom' && (
        <>
          <Pressable
            accessibilityLabel={`Custom time, ${selectedTimeLabel}. Choose a time`}
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            onPress={() => setExpanded((open) => !open)}
            style={styles.selectorRow}
          >
            <Text style={styles.selectorValue}>{selectedTimeLabel}</Text>
            <Text style={styles.chevron}>{expanded ? '⌃' : '⌄'}</Text>
          </Pressable>
          {expanded && (
            <ScrollView nestedScrollEnabled style={styles.hourList}>
              {timeSlots.map((slot, index) => {
                const active = selectedTime === slot.time;
                const label = formatTime(slot.time, timezone);
                const dayKey = getLocalDateKey(slot.time, timezone);
                const previousDayKey = index > 0
                  ? getLocalDateKey(timeSlots[index - 1].time, timezone)
                  : null;
                return (
                  <View key={slot.time}>
                    {dayKey !== previousDayKey && (
                      <Text style={styles.dayLabel}>{dayKey === today ? 'Today' : 'Tomorrow'}</Text>
                    )}
                    <Pressable
                      accessibilityLabel={label}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: active }}
                      onPress={() => {
                        onSelectHour(slot.time);
                        setExpanded(false);
                      }}
                      style={styles.hourOption}
                    >
                      <Text style={[styles.hourText, active && styles.activeHourText]}>{label}</Text>
                      {active && <Text style={styles.checkmark}>✓</Text>}
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 22 },
  modeChoices: { alignSelf: 'center', flexDirection: 'row', gap: 24, marginBottom: 9 },
  modeChoice: { borderBottomColor: 'transparent', borderBottomWidth: 1, paddingBottom: 4 },
  selectedModeChoice: { borderBottomColor: '#151515' },
  modeText: { color: '#777777', fontSize: 14 },
  selectedModeText: { color: '#151515' },
  dayLabel: { color: '#777777', fontSize: 11, paddingBottom: 4, paddingTop: 8 },
  selectorRow: {
    alignItems: 'center', borderBottomColor: '#D6D6D6', borderBottomWidth: 1,
    flexDirection: 'row', minHeight: 46, paddingVertical: 7,
  },
  selectorValue: { color: '#696969', flex: 1, fontSize: 14, paddingHorizontal: 24, textAlign: 'center' },
  chevron: { color: '#696969', fontSize: 17, lineHeight: 17, position: 'absolute', right: 4 },
  hourList: { borderBottomColor: '#D6D6D6', borderBottomWidth: 1, maxHeight: 200, paddingLeft: 16 },
  hourOption: {
    alignItems: 'center', borderBottomColor: '#EEEEEE', borderBottomWidth: 1,
    flexDirection: 'row', justifyContent: 'space-between', minHeight: 38, paddingRight: 4,
  },
  hourText: { color: '#696969', fontSize: 14 },
  activeHourText: { color: '#151515', fontWeight: '600' },
  checkmark: { color: '#151515', fontSize: 15, marginRight: 2 },
});
