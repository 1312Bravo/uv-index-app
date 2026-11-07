import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { PlanningTimeSelector } from './PlanningTimeSelector';
import type { TimePlan } from '../../domain/outing/timePlan';
import { getDurationOptions, getForecastEndTime } from '../../domain/outing/getDurationOptions';
import { convertInstantPreservingLocalTime, getNextHourInTimeZone } from '../../domain/time/zonedDateTime';
import { ChoiceOption, choiceFieldLayout, choiceListLayout } from '../../ui/ChoiceOption';
import { OptionScrollList } from '../../ui/OptionScrollList';
import { uiColors, uiType } from '../../ui/visualStyle';

type Props = {
  onChange: (plan: TimePlan | null) => void;
  chartSelection: ChartSelectedTimeRange | null;
  onReset: () => void;
  timeZone: string | null;
};

export type ChartSelectedTimeRange = {
  start: Date | null;
  end: Date;
};

type StartMode = 'now' | 'scheduled';
type EndMode = 'duration' | 'end-time';
type OpenSection = 'start' | 'start-time' | 'end' | 'duration' | 'end-time' | null;

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;

  return `${hours}:${String(remainingMinutes).padStart(2, '0')}`;
}

function formatPlanTime(value: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short', hour: 'numeric', minute: '2-digit', timeZone,
  }).format(value);
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
      accessibilityState={{ expanded }}
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

export function TimePlanner({ onChange, chartSelection, onReset, timeZone }: Props) {
  const { width } = useWindowDimensions();
  const isWideWeb = Platform.OS === 'web' && width >= 760;
  const [startMode, setStartMode] = useState<StartMode>('now');
  const [scheduledStart, setScheduledStart] = useState<Date | null>(null);
  const [endMode, setEndMode] = useState<EndMode>('duration');
  const [duration, setDuration] = useState(240);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<OpenSection>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const previousTimeZone = useRef<string | null>(null);
  const planStart = startMode === 'now' ? currentTime : scheduledStart;
  const forecastEndTime = timeZone ? getForecastEndTime(currentTime, timeZone).getTime() : null;
  const durationOptions = planStart && forecastEndTime !== null
    ? getDurationOptions(planStart, new Date(forecastEndTime))
    : [];

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
    if (!chartSelection) return;

    setStartMode(chartSelection.start === null ? 'now' : 'scheduled');
    setScheduledStart(chartSelection.start);
    setEndMode('end-time');
    setEndTime(chartSelection.end);
    setOpenSection(null);
    setError(null);
  }, [chartSelection]);

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
      if (!Number.isInteger(duration) || duration <= 0) {
        setError(null);
        clearPlan();
        return;
      }
      end = new Date(start.getTime() + duration * 60 * 1000);
      if (forecastEndTime !== null && end.getTime() > forecastEndTime) {
        setError('That duration goes beyond the available forecast. Choose a shorter duration or adjust the start time.');
        clearPlan();
        return;
      }
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
  }, [clearPlan, currentTime, duration, endMode, endTime, forecastEndTime, onChange, scheduledStart, startMode, timeZone]);

  function resetPlanner() {
    setStartMode('now');
    setScheduledStart(null);
    setEndMode('duration');
    setDuration(240);
    setEndTime(null);
    setError(null);
    setOpenSection(null);
    onReset();
  }

  return (
    <View style={[styles.section, choiceFieldLayout, isWideWeb && styles.webSection]}>
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
        value={startMode === 'now' ? 'Now' : 'Start time'}
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
              setOpenSection('start-time');
            }}
            showDivider
          />
        </View>
      )}

      {startMode === 'scheduled' && (
        <>
          <SelectorRow
            expanded={openSection === 'start-time'}
            label="Start time"
            onPress={() => setOpenSection(openSection === 'start-time' ? null : 'start-time')}
            value={scheduledStart && timeZone ? formatPlanTime(scheduledStart, timeZone) : 'Choose a time'}
          />
          {openSection === 'start-time' && timeZone && (
            <PlanningTimeSelector
              now={currentTime}
              onChange={setScheduledStart}
              timeZone={timeZone}
              value={scheduledStart}
            />
          )}
        </>
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
            value={formatDuration(duration)}
          />
          {openSection === 'duration' && (
            <OptionScrollList>
              {durationOptions.map((minutes) => (
                <ChoiceOption
                  key={minutes}
                  active={duration === minutes}
                  label={formatDuration(minutes)}
                  onPress={() => setDuration(minutes)}
                  showDivider
                />
              ))}
              {durationOptions.length === 0 && (
                <Text style={styles.hint}>{timeZone
                  ? 'No half-hour duration fits within the available forecast.'
                  : 'Loading the selected location\'s time zone...'}</Text>
              )}
            </OptionScrollList>
          )}
        </>
      ) : (
        <>
          <SelectorRow
            expanded={openSection === 'end-time'}
            label="End time"
            onPress={() => setOpenSection(openSection === 'end-time' ? null : 'end-time')}
            value={endTime && timeZone ? formatPlanTime(endTime, timeZone) : 'Choose a time'}
          />
          {openSection === 'end-time' && timeZone && (
            <PlanningTimeSelector
              after={startMode === 'scheduled' ? scheduledStart ?? currentTime : currentTime}
              now={currentTime}
              onChange={(value) => {
                setEndTime(value);
              }}
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
  webSection: { maxWidth: 520, width: '100%' },
  headingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 8, minHeight: 28, position: 'relative' },
  heading: { color: uiColors.ink, flex: 1, fontSize: uiType.sectionHeading, fontWeight: '600', textAlign: 'center' },
  resetButton: { paddingHorizontal: 4, paddingVertical: 8, position: 'absolute', right: 0 },
  resetText: { color: uiColors.secondary, fontSize: 12, textDecorationLine: 'underline' },
  selectorRow: { alignItems: 'center', borderBottomColor: uiColors.line, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 46, paddingVertical: 8 },
  selectorLabel: { color: uiColors.ink, fontSize: 14, flexShrink: 1 },
  selectorValueWrap: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'flex-end', maxWidth: '65%' },
  selectorValue: { color: uiColors.secondary, fontSize: 14, flexShrink: 1, textAlign: 'right' },
  selectorChevron: { color: uiColors.secondary, fontSize: 17, lineHeight: 17, minWidth: 16, textAlign: 'center' },
  buttonPressed: { opacity: 0.65 },
  error: { color: uiColors.faint, fontSize: 13, lineHeight: 19, marginTop: 12, textAlign: 'center' },
  hint: { color: uiColors.muted, fontSize: 12, lineHeight: 17, marginTop: 18, textAlign: 'center' },
});
