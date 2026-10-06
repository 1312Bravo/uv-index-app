import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { DateTimeField } from './DateTimeField';
import { getShadeLabel, SHADE_OPTIONS, type ShadeLevel } from '../../domain/outing/shadeOptions';
import type { TimePlan } from '../../domain/outing/timePlan';

type Props = {
  onChange: (plan: TimePlan | null) => void;
};

type StartMode = 'now' | 'scheduled';
type EndMode = 'duration' | 'end-time';
type OpenSection = 'start' | 'end' | 'duration' | 'shade' | null;

const DURATION_OPTIONS = [30, 60, 120, 180, 240];

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
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
  const [customDuration, setCustomDuration] = useState('');
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [shade, setShade] = useState<ShadeLevel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<OpenSection>(null);

  useEffect(() => {
    const now = new Date();
    const start = startMode === 'now' ? now : scheduledStart;
    if (!start) {
      setError(null);
      onChange(null);
      return;
    }

    if (startMode === 'scheduled' && start <= now) {
      setError('Choose a start time in the future.');
      onChange(null);
      return;
    }

    let end: Date | null = null;
    if (endMode === 'duration') {
      const minutes = duration ?? (isCustomDuration ? Number(customDuration) : NaN);
      if (!Number.isInteger(minutes) || minutes <= 0) {
        setError(null);
        onChange(null);
        return;
      }
      end = new Date(start.getTime() + minutes * 60 * 1000);
    } else {
      end = endTime;
      if (!end) {
        setError(null);
        onChange(null);
        return;
      }
    }

    if (end <= start) {
      setError('End time must be after the start time.');
      onChange(null);
      return;
    }

    if (endMode === 'end-time' && end <= now) {
      setError('Choose an end time in the future.');
      onChange(null);
      return;
    }

    const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
    setError(null);
    onChange({ start, end, durationMinutes, ...(shade ? { shade } : {}) });
  }, [customDuration, duration, endMode, endTime, isCustomDuration, onChange, scheduledStart, shade, startMode]);

  const selectedDuration = duration !== null
    ? duration
    : isCustomDuration
      ? Number(customDuration) || null
      : null;

  function resetPlanner() {
    setStartMode('now');
    setScheduledStart(null);
    setEndMode('duration');
    setDuration(null);
    setIsCustomDuration(false);
    setCustomDuration('');
    setEndTime(null);
    setShade(null);
    setError(null);
    setOpenSection(null);
  }

  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>When are you going outside?</Text>
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
                    setCustomDuration('');
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
            <TextInput
              accessibilityLabel="Custom duration in minutes"
              keyboardType="number-pad"
              onChangeText={setCustomDuration}
              placeholder="Custom duration in minutes"
              placeholderTextColor="#909090"
              style={styles.input}
              value={customDuration}
            />
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

      <SelectorRow
        expanded={openSection === 'shade'}
        label="Shade (optional)"
        onPress={() => setOpenSection(openSection === 'shade' ? null : 'shade')}
        value={shade ? getShadeLabel(shade) : 'Not specified'}
      />
      {openSection === 'shade' && (
        <View style={styles.selectorOptions}>
          <SelectorOption
            active={shade === null}
            label="Not specified"
            onPress={() => {
              setShade(null);
              setOpenSection(null);
            }}
          />
          {SHADE_OPTIONS.map((option) => (
            <SelectorOption
              key={option.value}
              active={shade === option.value}
              label={option.label}
              onPress={() => {
                setShade(option.value);
                setOpenSection(null);
              }}
            />
          ))}
        </View>
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
  input: { borderColor: '#D6D6D6', borderRadius: 9, borderWidth: 1, color: '#151515', fontSize: 14, marginTop: 10, minHeight: 46, paddingHorizontal: 12 },
  error: { color: '#9C3D32', fontSize: 13, lineHeight: 19, marginTop: 12, textAlign: 'center' },
  summary: { color: '#151515', fontSize: 14, lineHeight: 20, marginTop: 14, textAlign: 'center' },
  hint: { color: '#999999', fontSize: 11, lineHeight: 16, marginTop: 18, textAlign: 'center' },
});
