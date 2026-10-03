import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { createElement, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  accessibilityLabel: string;
  minimumDate?: Date;
  onChange: (value: Date) => void;
  placeholder: string;
  value: Date | null;
};

function formatDisplay(value: Date): string {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(value);
}

function formatWebValue(value: Date | null): string {
  if (!value) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

function parseWebValue(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]));
}

function WebDateTimeField({ accessibilityLabel, minimumDate, onChange, value }: Props) {
  return createElement('input', {
    'aria-label': accessibilityLabel,
    min: formatWebValue(minimumDate ?? null),
    onChange: (event: { currentTarget: { value: string } }) => {
      const nextValue = parseWebValue(event.currentTarget.value);
      if (nextValue && !Number.isNaN(nextValue.getTime())) onChange(nextValue);
    },
    style: styles.webInput,
    type: 'datetime-local',
    value: formatWebValue(value),
  });
}

export function DateTimeField(props: Props) {
  const { accessibilityLabel, minimumDate, onChange, placeholder, value } = props;
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
      const nextDate = new Date(draftDate);
      nextDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDraftDate(nextDate);
      setPickerMode('time');
      return;
    }

    const nextDate = new Date(draftDate);
    nextDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
    onChange(nextDate);
    setPickerMode(null);
  }

  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={openPicker} style={styles.nativeField}>
        <Text style={value ? styles.nativeValue : styles.nativePlaceholder}>{value ? formatDisplay(value) : placeholder}</Text>
      </Pressable>
      {pickerMode && (
        <DateTimePicker display="default" minimumDate={minimumDate} mode={pickerMode} onChange={handlePickerChange} value={draftDate ?? new Date()} />
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
