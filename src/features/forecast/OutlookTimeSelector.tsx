import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getLocalDateKey } from '../../domain/daylight/getDaylightEvents';
import type { ForecastHour } from '../../domain/forecast/forecastTypes';
import { ChoiceOption, choiceFieldLayout } from '../../ui/ChoiceOption';
import { OptionScrollList } from '../../ui/OptionScrollList';
import { uiColors } from '../../ui/visualStyle';
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
  const [isTimeListOpen, setIsTimeListOpen] = useState(false);
  const timeSlots = getOutlookTimeSlots(hours, timezone, nowTime);
  const today = getLocalDateKey(nowTime / 1000, timezone);
  const selectedTimeLabel = selectedTime === null
    ? 'Choose a time'
    : formatDateTime(selectedTime, timezone);

  return (
    <View style={styles.section}>
      <View style={[styles.modeChoices, mode === 'custom' && styles.customModeChoices]}>
        {(['now', 'custom'] as const).map((choice) => {
          const active = mode === choice;
          return (
            <Pressable
              key={choice}
              accessibilityRole="button"
              accessibilityState={choice === 'custom'
                ? { expanded: isTimeListOpen, selected: active }
                : { selected: active }}
              onPress={() => {
                if (choice === 'now') {
                  setIsTimeListOpen(false);
                  onSelectMode('now');
                  return;
                }

                if (mode === 'custom') {
                  setIsTimeListOpen((open) => !open);
                  return;
                }

                onSelectMode('custom');
                setIsTimeListOpen(true);
              }}
              style={[styles.modeChoice, active && styles.selectedModeChoice]}
            >
              <View style={styles.modeChoiceContent}>
                <Text style={[styles.modeText, active && styles.selectedModeText]}>
                  {choice === 'now' ? 'Now' : 'Custom time'}
                </Text>
                {choice === 'custom' && (
                  <Text style={[styles.selectorChevron, active && styles.selectedModeText]}>
                    {isTimeListOpen ? '⌃' : '⌄'}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
      {mode === 'custom' && (
        <>
          <View style={[choiceFieldLayout, styles.selectedTime]}>
            <Text style={styles.selectorValue}>{selectedTimeLabel}</Text>
          </View>
          {isTimeListOpen && (
            <OptionScrollList style={styles.hourList}>
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
                    <ChoiceOption active={active} label={label} onPress={() => onSelectHour(slot.time)} />
                  </View>
                );
              })}
            </OptionScrollList>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 0 },
  modeChoices: { alignSelf: 'center', flexDirection: 'row', gap: 24 },
  customModeChoices: { marginBottom: 8 },
  modeChoice: { borderBottomColor: 'transparent', borderBottomWidth: 2, paddingBottom: 4 },
  modeChoiceContent: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  selectedModeChoice: { borderBottomColor: uiColors.accent },
  modeText: { color: uiColors.muted, fontSize: 14 },
  selectedModeText: { color: uiColors.ink },
  dayLabel: { color: uiColors.muted, fontSize: 12, paddingBottom: 4, paddingHorizontal: 6, paddingTop: 8 },
  selectedTime: { alignItems: 'center', justifyContent: 'center', marginTop: 12, minHeight: 36 },
  selectorValue: { color: uiColors.secondary, flex: 1, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  selectorChevron: { color: uiColors.muted, fontSize: 15, lineHeight: 17 },
  hourList: { marginTop: 4 },
});
