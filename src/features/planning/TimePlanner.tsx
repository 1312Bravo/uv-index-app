import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { DateTimeField } from './DateTimeField';
import type { TimePlan } from '../../domain/outing/timePlan';

type Props = {
  onChange: (plan: TimePlan | null) => void;
};

type StartMode = 'now' | 'scheduled';
type EndMode = 'duration' | 'end-time';
type OpenSection = 'start' | 'end' | 'duration' | null;

const DURATION_OPTIONS = [30, 60, 120, 180, 240];

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;

  return `${hours}:${String(remainingMinutes).padStart(2, '0')}`;
}

function getCustomDurationMinutes(hoursText: string, minutesText: string): number | null {
  if (hoursText === '' && minutesText === '') return null;

  const hours = hoursText === '' ? 0 : Number(hoursText);
  const minutes = minutesText === '' ? 0 : Number(minutesText);
  if (!Number.isInteger(hours) || hours < 0 || !Number.isInteger(minutes) || minutes < 0 || minutes > 59) {
    return null;
  }

  const totalMinutes = hours * 60 + minutes;
  return totalMinutes > 0 ? totalMinutes : null;
}

function formatTime(value: Date): string {
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(value);
}

function nextHour(): Date {
  const value = new Date();
  value.setMinutes(0, 0, 0);
  value.setHours(value.getHours() + 1);
  return value;
}

function SelectorRow({
  expanded,
  label,
  onPress,
  value,
}: {
  expanded: boolean;
  label: string;
  onPress: () => void;
  value: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.selectorRow, pressed && styles.buttonPressed]}
    >
      <Text style={styles.selectorLabel}>{label}</Text>
      <View style={styles.selectorValueWrap}>
        <Text style={styles.selectorValue}>{value}</Text>
        <Text style={styles.selectorChevron}>{expanded ? '⌃' : '⌄'}</Text>
      </View>
    </Pressable>
  );
}

function SelectorOption({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.selectorOption, pressed && styles.buttonPressed]}
    >
      <Text style={[styles.selectorOptionText, active && styles.selectorOptionTextActive]}>{label}</Text>
      {active && <Text style={styles.checkmark}>✓</Text>}
    </Pressable>
  );
}

export function TimePlanner({ onChange }: Props) {
  const [startMode, setStartMode] = useState<StartMode>('now');
  const [scheduledStart, setScheduledStart] = useState<Date | null>(null);
  const [endMode, setEndMode] = useState<EndMode>('duration');
  const [duration, setDuration] = useState<number | null>(null);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customHours, setCustomHours] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<OpenSection>(null);

  const clearPlan = useCallback(() => {
    onChange(null);
  }, [onChange]);

  useEffect(() => {
    const now = new Date();
    const start = startMode === 'now' ? now : scheduledStart;
    if (!start) {
      setError(null);
      clearPlan();
      return;
    }

    if (startMode === 'scheduled' && start <= now) {
      setError('Choose a start time in the future.');
      clearPlan();
      return;
    }

    let end: Date | null = null;
    if (endMode === 'duration') {
      const minutes = duration ?? (isCustomDuration ? getCustomDurationMinutes(customHours, customMinutes) : NaN);
      if (isCustomDuration && minutes === null) {
        const enteredMinutes = customMinutes === '' ? 0 : Number(customMinutes);
        const invalidInput = (customHours !== '' && (!Number.isInteger(Number(customHours)) || Number(customHours) < 0)) ||
          (customMinutes !== '' && (!Number.isInteger(enteredMinutes) || enteredMinutes < 0 || enteredMinutes > 59));
        setError(invalidInput ? 'Enter whole hours and minutes from 0 to 59.' : null);
        clearPlan();
        return;
      }
      if (minutes === null || !Number.isInteger(minutes) || minutes <= 0) {
        setError(null);
        clearPlan();
        return;
      }
      end = new Date(start.getTime() + minutes * 60 * 1000);
    } else {
      end = endTime;
      if (!end) {
        setError(null);
        clearPlan();
        return;
      }
    }

    if (end <= start) {
      setError('End time must be after the start time.');
      clearPlan();
      return;
    }

    if (endMode === 'end-time' && end <= now) {
      setError('Choose an end time in the future.');
      clearPlan();
      return;
    }

    const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
    setError(null);
    const plan = { start, end, durationMinutes };
    onChange(plan);
  }, [clearPlan, customHours, customMinutes, duration, endMode, endTime, isCustomDuration, onChange, scheduledStart, startMode]);

  const selectedDuration = duration !== null
    ? duration
      : isCustomDuration
      ? getCustomDurationMinutes(customHours, customMinutes)
      : null;

  function resetPlanner() {
    setStartMode('now');
    setScheduledStart(null);
    setEndMode('duration');
    setDuration(null);
    setIsCustomDuration(false);
    setCustomHours('');
    setCustomMinutes('');
    setEndTime(null);
    setError(null);
    setOpenSection(null);
  }

  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>Plan an outing</Text>
        <Pressable
          accessibilityLabel="Reset outing choices"
          accessibilityRole="button"
          onPress={resetPlanner}
          style={({ pressed }) => [styles.resetButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <SelectorRow
        expanded={openSection === 'start'}
        label="Start"
        onPress={() => setOpenSection(openSection === 'start' ? null : 'start')}
        value={startMode === 'now' ? 'Now' : 'Choose a time'}
      />
      {openSection === 'start' && (
        <View style={styles.selectorOptions}>
          <SelectorOption
            active={startMode === 'now'}
            label="Now"
            onPress={() => {
              setStartMode('now');
              setOpenSection(null);
            }}
          />
          <SelectorOption
            active={startMode === 'scheduled'}
            label="Choose a start time"
            onPress={() => {
              setStartMode('scheduled');
              if (!scheduledStart) setScheduledStart(nextHour());
              setOpenSection(null);
            }}
          />
        </View>
      )}

      {startMode === 'scheduled' && (
        <DateTimeField
          accessibilityLabel="Start date and time"
          minimumDate={new Date()}
          onChange={setScheduledStart}
          placeholder="Choose start date and time"
          value={scheduledStart}
        />
      )}

      <SelectorRow
        expanded={openSection === 'end'}
        label="End"
        onPress={() => setOpenSection(openSection === 'end' ? null : 'end')}
        value={endMode === 'duration' ? 'Duration' : 'End time'}
      />
      {openSection === 'end' && (
        <View style={styles.selectorOptions}>
          <SelectorOption
            active={endMode === 'duration'}
            label="Choose a duration"
            onPress={() => {
              setEndMode('duration');
              setOpenSection(null);
            }}
          />
          <SelectorOption
            active={endMode === 'end-time'}
            label="Set an end time"
            onPress={() => {
              setEndMode('end-time');
              setOpenSection(null);
            }}
          />
        </View>
      )}

      {endMode === 'duration' ? (
        <>
          <SelectorRow
            expanded={openSection === 'duration'}
            label="Duration"
            onPress={() => setOpenSection(openSection === 'duration' ? null : 'duration')}
            value={selectedDuration ? formatDuration(selectedDuration) : isCustomDuration ? 'Custom' : 'Choose a duration'}
          />
          {openSection === 'duration' && (
            <View style={styles.selectorOptions}>
              {DURATION_OPTIONS.map((minutes) => (
                <SelectorOption
                  key={minutes}
                  active={duration === minutes}
                  label={formatDuration(minutes)}
                  onPress={() => {
                    setDuration(minutes);
                    setIsCustomDuration(false);
                    setCustomHours('');
                    setCustomMinutes('');
                    setOpenSection(null);
                  }}
                />
              ))}
              <SelectorOption
                active={isCustomDuration}
                label="Custom"
                onPress={() => {
                  setDuration(null);
                  setIsCustomDuration(true);
                  setOpenSection(null);
                }}
              />
            </View>
          )}
          {isCustomDuration && (
            <View style={styles.customDurationInputs}>
              <TextInput
                accessibilityLabel="Custom duration hours"
                keyboardType="number-pad"
                maxLength={3}
                onChangeText={setCustomHours}
                placeholder="Hours"
                placeholderTextColor="#909090"
                style={styles.input}
                value={customHours}
              />
              <Text style={styles.durationSeparator}>:</Text>
              <TextInput
                accessibilityLabel="Custom duration minutes, 0 to 59"
                keyboardType="number-pad"
                maxLength={2}
                onChangeText={setCustomMinutes}
                placeholder="Minutes"
                placeholderTextColor="#909090"
                style={styles.input}
                value={customMinutes}
              />
            </View>
          )}
        </>
      ) : (
        <DateTimeField
          accessibilityLabel="End date and time"
          minimumDate={startMode === 'scheduled' ? scheduledStart ?? new Date() : new Date()}
          onChange={setEndTime}
          placeholder="Choose end date and time"
          value={endTime}
        />
      )}

      {error && <Text style={styles.error}>{error}</Text>}
      {!error && endMode === 'duration' && selectedDuration && (
        <Text style={styles.summary}>
          {startMode === 'now' ? 'Starting now' : `Starting at ${formatTime(scheduledStart ?? new Date())}`} · {formatDuration(selectedDuration)}
        </Text>
      )}
      {!error && endMode === 'end-time' && endTime && (
        <Text style={styles.summary}>
          {startMode === 'now' ? 'Starting now' : `Starting at ${formatTime(scheduledStart ?? new Date())}`} · ending at {formatTime(endTime)}
        </Text>
      )}
      <Text style={styles.hint}>Times use your device's local time.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  headingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 12, minHeight: 28, position: 'relative' },
  heading: { color: '#151515', flex: 1, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  resetButton: { paddingHorizontal: 4, paddingVertical: 8, position: 'absolute', right: 0 },
  resetText: { color: '#696969', fontSize: 12, textDecorationLine: 'underline' },
  selectorRow: { alignItems: 'center', borderBottomColor: '#D6D6D6', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 50, paddingVertical: 12 },
  selectorLabel: { color: '#151515', fontSize: 14 },
  selectorValueWrap: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  selectorValue: { color: '#696969', fontSize: 14 },
  selectorChevron: { color: '#696969', fontSize: 17, lineHeight: 17 },
  selectorOptions: { borderBottomColor: '#D6D6D6', borderBottomWidth: 1, paddingLeft: 16 },
  selectorOption: { alignItems: 'center', borderBottomColor: '#EEEEEE', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 44, paddingRight: 4 },
  selectorOptionText: { color: '#696969', fontSize: 14 },
  selectorOptionTextActive: { color: '#151515', fontWeight: '600' },
  checkmark: { color: '#151515', fontSize: 15, marginRight: 2 },
  buttonPressed: { opacity: 0.65 },
  customDurationInputs: { alignItems: 'center', flexDirection: 'row', gap: 10, marginTop: 10 },
  input: { borderColor: '#D6D6D6', borderRadius: 9, borderWidth: 1, color: '#151515', flex: 1, fontSize: 14, minHeight: 46, paddingHorizontal: 12, textAlign: 'center' },
  durationSeparator: { color: '#696969', fontSize: 18 },
  error: { color: '#9C3D32', fontSize: 13, lineHeight: 19, marginTop: 12, textAlign: 'center' },
  summary: { color: '#151515', fontSize: 14, lineHeight: 20, marginTop: 14, textAlign: 'center' },
  hint: { color: '#999999', fontSize: 11, lineHeight: 16, marginTop: 18, textAlign: 'center' },
});
