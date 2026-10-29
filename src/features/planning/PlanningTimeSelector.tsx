import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getPlanningTimeSlots } from '../../domain/outing/getPlanningTimeSlots';
import { ChoiceOption } from '../../ui/ChoiceOption';
import { OptionScrollList } from '../../ui/OptionScrollList';
import { uiColors } from '../../ui/visualStyle';

type Props = {
  now: Date;
  onChange: (value: Date) => void;
  after?: Date;
  timeZone: string;
  value: Date | null;
};

export function PlanningTimeSelector({ now, after = now, onChange, timeZone, value }: Props) {
  const slots = useMemo(
    () => getPlanningTimeSlots(now, after, timeZone),
    [now, after, timeZone],
  );
  const timeFormatter = useMemo(
    () => new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit', timeZone }),
    [timeZone],
  );
  const timeWithZoneFormatter = useMemo(
    () => new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit', timeZone, timeZoneName: 'short' }),
    [timeZone],
  );
  const dayFormatter = useMemo(
    () => new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone }),
    [timeZone],
  );
  const today = dayFormatter.format(now);
  const choices = useMemo(() => {
    const datedSlots = slots.map((slot) => ({
      slot,
      day: dayFormatter.format(slot),
      time: timeFormatter.format(slot),
    }));
    const counts = new Map<string, number>();
    for (const choice of datedSlots) {
      const key = `${choice.day}|${choice.time}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return datedSlots.map((choice) => {
      const repeated = (counts.get(`${choice.day}|${choice.time}`) ?? 0) > 1;
      return { ...choice, repeated, label: repeated ? timeWithZoneFormatter.format(choice.slot) : choice.time };
    });
  }, [dayFormatter, slots, timeFormatter, timeWithZoneFormatter]);
  return (
    <View style={styles.section}>
      <OptionScrollList>
        {choices.map((choice, index) => {
          const previousKey = index > 0 ? choices[index - 1].day : null;
          return (
            <View key={choice.slot.getTime()}>
              {choice.day !== previousKey && <Text style={styles.dayLabel}>{choice.day === today ? 'Today' : 'Tomorrow'}</Text>}
              <ChoiceOption
                active={value?.getTime() === choice.slot.getTime()}
                label={choice.label}
                onPress={() => onChange(choice.slot)}
                showDivider
              />
            </View>
          );
        })}
        {slots.length === 0 && <Text style={styles.empty}>No half-hour times left through tomorrow.</Text>}
      </OptionScrollList>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 4 },
  dayLabel: { color: uiColors.muted, fontSize: 12, paddingBottom: 4, paddingHorizontal: 6, paddingTop: 8 },
  empty: { color: uiColors.muted, fontSize: 12, lineHeight: 18, paddingVertical: 12, textAlign: 'center' },
});
