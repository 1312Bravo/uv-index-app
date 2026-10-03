import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { DateTimeField } from './DateTimeField';

export type TimePlan = {
  start: Date;
  end: Date;
  durationMinutes: number;
};

type Props = {
  onChange: (plan: TimePlan | null) => void;
};

type StartMode = 'now' | 'scheduled';
type EndMode = 'duration' | 'end-time';

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

function ChoiceButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.choice, active && styles.choiceActive, pressed && styles.buttonPressed]}
    >
      <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{label}</Text>
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
  const [error, setError] = useState<string | null>(null);

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
    onChange({ start, end, durationMinutes });
  }, [customDuration, duration, endMode, endTime, isCustomDuration, onChange, scheduledStart, startMode]);

  const selectedDuration = duration !== null
    ? duration
    : isCustomDuration
      ? Number(customDuration) || null
      : null;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>When are you going outside?</Text>

      <Text style={styles.label}>Start</Text>
      <View style={styles.choices}>
        <ChoiceButton active={startMode === 'now'} label="Now" onPress={() => setStartMode('now')} />
        <ChoiceButton
          active={startMode === 'scheduled'}
          label="Choose start time"
          onPress={() => {
            setStartMode('scheduled');
            if (!scheduledStart) setScheduledStart(nextHour());
          }}
        />
      </View>

      {startMode === 'scheduled' && (
        <DateTimeField
          accessibilityLabel="Start date and time"
          minimumDate={new Date()}
          onChange={setScheduledStart}
          placeholder="Choose start date and time"
          value={scheduledStart}
        />
      )}

      <Text style={styles.label}>End</Text>
      <View style={styles.choices}>
        <ChoiceButton active={endMode === 'duration'} label="Choose duration" onPress={() => setEndMode('duration')} />
        <ChoiceButton active={endMode === 'end-time'} label="Set end time" onPress={() => setEndMode('end-time')} />
      </View>

      {endMode === 'duration' ? (
        <>
          <View style={styles.choices}>
            {DURATION_OPTIONS.map((minutes) => (
              <ChoiceButton
                key={minutes}
                active={duration === minutes}
                label={formatDuration(minutes)}
                onPress={() => {
                  setDuration(minutes);
                  setIsCustomDuration(false);
                  setCustomDuration('');
                }}
              />
            ))}
            <ChoiceButton
              active={isCustomDuration}
              label="Custom"
              onPress={() => {
                setDuration(null);
                setIsCustomDuration(true);
              }}
            />
          </View>
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
  heading: { color: '#151515', fontSize: 18, fontWeight: '600', marginBottom: 20 },
  label: { color: '#555555', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { borderColor: '#D6D6D6', borderRadius: 9, borderWidth: 1, minHeight: 42, justifyContent: 'center', paddingHorizontal: 12 },
  choiceActive: { backgroundColor: '#F1F1F1', borderColor: '#151515' },
  choiceText: { color: '#555555', fontSize: 13 },
  choiceTextActive: { color: '#151515', fontWeight: '600' },
  buttonPressed: { opacity: 0.65 },
  input: { borderColor: '#D6D6D6', borderRadius: 9, borderWidth: 1, color: '#151515', fontSize: 14, marginTop: 10, minHeight: 46, paddingHorizontal: 12 },
  error: { color: '#9C3D32', fontSize: 13, lineHeight: 19, marginTop: 12 },
  summary: { color: '#151515', fontSize: 14, lineHeight: 20, marginTop: 14 },
  hint: { color: '#999999', fontSize: 11, lineHeight: 16, marginTop: 18 },
});
