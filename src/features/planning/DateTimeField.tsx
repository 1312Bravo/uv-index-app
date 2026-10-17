import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { createElement, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { createDateInTimeZone, getZonedDateTimeParts } from '../../domain/time/zonedDateTime';

type Props = {
  accessibilityLabel: string;
  minimumDate?: Date;
  onChange: (value: Date) => void;
  placeholder: string;
  timeZone: string;
  value: Date | null;
};

function formatDisplay(value: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short', timeZone }).format(value);
}

function formatWebValue(value: Date | null, timeZone: string): string {
  if (!value) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  const parts = getZonedDateTimeParts(value, timeZone);
  return parts.year + '-' + pad(parts.month) + '-' + pad(parts.day) + 'T' + pad(parts.hour) + ':' + pad(parts.minute);
}

function parseWebValue(value: string, timeZone: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  return createDateInTimeZone({
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
  }, timeZone);
}

function WebDateTimeField({ accessibilityLabel, minimumDate, onChange, timeZone, value }: Props) {
  return createElement('input', {
    'aria-label': accessibilityLabel,
    min: formatWebValue(minimumDate ?? null, timeZone),
    onChange: (event: { currentTarget: { value: string } }) => {
      const nextValue = parseWebValue(event.currentTarget.value, timeZone);
      if (nextValue && !Number.isNaN(nextValue.getTime())) onChange(nextValue);
    },
    style: styles.webInput,
    type: 'datetime-local',
    value: formatWebValue(value, timeZone),
  });
}

export function DateTimeField(props: Props) {
  const { accessibilityLabel, minimumDate, onChange, placeholder, timeZone, value } = props;
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);
  const [draftDate, setDraftDate] = useState<Date | null>(value);

  if (Platform.OS === 'web') return <WebDateTimeField {...props} />;

  function openPicker() {
    setDraftDate(value ?? new Date());
    setPickerMode('date');
  }

  function handlePickerChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (event.type === 'dismissed' || !selectedDate || !draftDate) {
      setPickerMode(null);
      return;
    }

    if (pickerMode === 'date') {
      const selectedParts = getZonedDateTimeParts(selectedDate, timeZone);
      const draftParts = getZonedDateTimeParts(draftDate, timeZone);
      const nextDate = createDateInTimeZone({
        ...draftParts,
        year: selectedParts.year,
        month: selectedParts.month,
        day: selectedParts.day,
      }, timeZone);
      setDraftDate(nextDate);
      setPickerMode('time');
      return;
    }

    const selectedParts = getZonedDateTimeParts(selectedDate, timeZone);
    const draftParts = getZonedDateTimeParts(draftDate, timeZone);
    const nextDate = createDateInTimeZone({
      ...draftParts,
      hour: selectedParts.hour,
      minute: selectedParts.minute,
    }, timeZone);
    onChange(nextDate);
    setPickerMode(null);
  }

  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={openPicker} style={styles.nativeField}>
        <Text style={value ? styles.nativeValue : styles.nativePlaceholder}>{value ? formatDisplay(value, timeZone) : placeholder}</Text>
      </Pressable>
      {pickerMode && (
        <DateTimePicker display="default" minimumDate={minimumDate} mode={pickerMode} onChange={handlePickerChange} timeZoneName={timeZone} value={draftDate ?? new Date()} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  nativeField: { borderColor: '#D6D6D6', borderRadius: 9, borderWidth: 1, justifyContent: 'center', marginTop: 10, minHeight: 46, paddingHorizontal: 12 },
  nativeValue: { color: '#151515', fontSize: 14 },
  nativePlaceholder: { color: '#909090', fontSize: 14 },
  webInput: { backgroundColor: '#FFFFFF', borderColor: '#D6D6D6', borderRadius: 9, borderStyle: 'solid', borderWidth: 1, boxSizing: 'border-box', color: '#151515', fontFamily: 'inherit', fontSize: 14, marginTop: 10, paddingLeft: 12, paddingRight: 12, width: '100%' },
});
