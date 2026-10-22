import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { DateTimeField } from './DateTimeField';
import { EndTimeSelector } from './EndTimeSelector';
import type { TimePlan } from '../../domain/outing/timePlan';
import { convertInstantPreservingLocalTime, getNextHourInTimeZone } from '../../domain/time/zonedDateTime';
import { ChoiceOption, choiceFieldLayout, choiceListLayout } from '../../ui/ChoiceOption';
import { uiColors, uiType } from '../../ui/visualStyle';

type Props = {
  onChange: (plan: TimePlan | null) => void;
  timeZone: string | null;
};

type StartMode = 'now' | 'scheduled';
type EndMode = 'duration' | 'end-time';
type OpenSection = 'start' | 'end' | 'duration' | 'end-time' | null;

const DURATION_OPTIONS = [30, 60, 120, 180, 240];

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;

  return `${hours}:${String(remainingMinutes).padStart(2, '0')}`;
}

function formatEndTime(value: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short', hour: 'numeric', minute: '2-digit', timeZone,
  }).format(value);
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

export function TimePlanner({ onChange, timeZone }: Props) {
  const [startMode, setStartMode] = useState<StartMode>('now');
  const [scheduledStart, setScheduledStart] = useState<Date | null>(null);
  const [endMode, setEndMode] = useState<EndMode>('duration');
  const [duration, setDuration] = useState<number | null>(240);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customHours, setCustomHours] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<OpenSection>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const previousTimeZone = useRef<string | null>(null);

  const clearPlan = useCallback(() => {
    onChange(null);
  }, [onChange]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!timeZone) return;

    const previous = previousTimeZone.current;
    if (previous && previous !== timeZone) {
      setScheduledStart((value) => value ? convertInstantPreservingLocalTime(value, previous, timeZone) : value);
      setEndTime((value) => value ? convertInstantPreservingLocalTime(value, previous, timeZone) : value);
    }
    previousTimeZone.current = timeZone;
  }, [timeZone]);

  useEffect(() => {
    if (startMode === 'scheduled' && !scheduledStart) {
      if (timeZone) setScheduledStart(getNextHourInTimeZone(currentTime, timeZone));
    }
  }, [currentTime, scheduledStart, startMode, timeZone]);

  useEffect(() => {
    if (startMode === 'scheduled' && !timeZone) {
      clearPlan();
      return;
    }
    const now = currentTime;
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
  }, [clearPlan, currentTime, customHours, customMinutes, duration, endMode, endTime, isCustomDuration, onChange, scheduledStart, startMode, timeZone]);

  const selectedDuration = duration !== null
    ? duration
    : isCustomDuration
      ? getCustomDurationMinutes(customHours, customMinutes)
      : null;

  function resetPlanner() {
    setStartMode('now');
    setScheduledStart(null);
    setEndMode('duration');
    setDuration(240);
    setIsCustomDuration(false);
    setCustomHours('');
    setCustomMinutes('');
    setEndTime(null);
    setError(null);
    setOpenSection(null);
  }

  return (
    <View style={[styles.section, choiceFieldLayout]}>
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
        <View style={choiceListLayout}>
          <ChoiceOption
            active={startMode === 'now'}
            label="Now"
            onPress={() => {
              setStartMode('now');
              setOpenSection(null);
            }}
            showDivider
          />
          <ChoiceOption
            active={startMode === 'scheduled'}
            label="Choose a start time"
            onPress={() => {
              setStartMode('scheduled');
              if (!scheduledStart && timeZone) setScheduledStart(getNextHourInTimeZone(currentTime, timeZone));
              setOpenSection(null);
            }}
            showDivider
          />
        </View>
      )}

      {startMode === 'scheduled' && timeZone && (
        <DateTimeField
          accessibilityLabel="Start date and time"
          minimumDate={new Date()}
          onChange={setScheduledStart}
          placeholder="Choose start date and time"
          timeZone={timeZone}
          value={scheduledStart}
        />
      )}
      {startMode === 'scheduled' && !timeZone && <Text style={styles.hint}>Loading the selected location's time zone...</Text>}

      <SelectorRow
        expanded={openSection === 'end'}
        label="End"
        onPress={() => setOpenSection(openSection === 'end' ? null : 'end')}
        value={endMode === 'duration' ? 'Duration' : 'End time'}
      />
      {openSection === 'end' && (
        <View style={choiceListLayout}>
          <ChoiceOption
            active={endMode === 'duration'}
            label="Choose a duration"
            onPress={() => {
              setEndMode('duration');
              setOpenSection('end');
            }}
            showDivider
          />
          <ChoiceOption
            active={endMode === 'end-time'}
            label="Set an end time"
            onPress={() => {
              setEndMode('end-time');
              setOpenSection('end');
            }}
            showDivider
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
            <View style={choiceListLayout}>
              {DURATION_OPTIONS.map((minutes) => (
                <ChoiceOption
                  key={minutes}
                  active={duration === minutes}
                  label={formatDuration(minutes)}
                  onPress={() => {
                    setDuration(minutes);
                    setIsCustomDuration(false);
                    setCustomHours('');
                    setCustomMinutes('');
                  }}
                  showDivider
                />
              ))}
              <ChoiceOption
                active={isCustomDuration}
                label="Custom"
                onPress={() => {
                  setDuration(null);
                  setIsCustomDuration(true);
                }}
                showDivider
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
        <>
          <SelectorRow
            expanded={openSection === 'end-time'}
            label="End time"
            onPress={() => setOpenSection(openSection === 'end-time' ? null : 'end-time')}
            value={endTime && timeZone ? formatEndTime(endTime, timeZone) : 'Choose a time'}
          />
          {openSection === 'end-time' && timeZone && (
            <EndTimeSelector
              now={currentTime}
              onChange={(value) => {
                setEndTime(value);
              }}
              start={startMode === 'scheduled' ? scheduledStart ?? currentTime : currentTime}
              timeZone={timeZone}
              value={endTime}
            />
          )}
          {openSection === 'end-time' && !timeZone && (
            <Text style={styles.hint}>Loading the selected location's time zone...</Text>
          )}
        </>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
      {timeZone && (startMode === 'scheduled' || endMode === 'end-time') && (
        <Text style={styles.hint}>Times are local to the selected location.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  headingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 8, minHeight: 28, position: 'relative' },
  heading: { color: uiColors.ink, flex: 1, fontSize: uiType.sectionHeading, fontWeight: '600', textAlign: 'center' },
  resetButton: { paddingHorizontal: 4, paddingVertical: 8, position: 'absolute', right: 0 },
  resetText: { color: '#696969', fontSize: 12, textDecorationLine: 'underline' },
  selectorRow: { alignItems: 'center', borderBottomColor: uiColors.line, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 46, paddingVertical: 8 },
  selectorLabel: { color: uiColors.ink, fontSize: 14, flexShrink: 1 },
  selectorValueWrap: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'flex-end', maxWidth: '65%' },
  selectorValue: { color: uiColors.secondary, fontSize: 14, flexShrink: 1, textAlign: 'right' },
  selectorChevron: { color: uiColors.secondary, fontSize: 17, lineHeight: 17, minWidth: 16, textAlign: 'center' },
  buttonPressed: { opacity: 0.65 },
  customDurationInputs: { alignItems: 'center', flexDirection: 'row', gap: 10, marginTop: 10 },
  input: { borderColor: uiColors.line, borderRadius: 10, borderWidth: 1, color: uiColors.ink, flex: 1, fontSize: 14, minHeight: 48, paddingHorizontal: 12, textAlign: 'center' },
  durationSeparator: { color: '#696969', fontSize: 18 },
  error: { color: '#A6A6A6', fontSize: 13, lineHeight: 19, marginTop: 12, textAlign: 'center' },
  hint: { color: '#999999', fontSize: 12, lineHeight: 17, marginTop: 18, textAlign: 'center' },
});
