import { StyleSheet, Text, View } from 'react-native';

import type { ForecastHour } from '../../domain/forecast/forecastTypes';
import { BIN_WIDTH, type SelectedRange } from './hourlyChartLayout';

const BAR_WIDTH = 16;
const BAR_AREA_HEIGHT = 78;
const MAX_BAR_HEIGHT = 58;

type Props = {
  hour: ForecastHour;
  timezone: string;
  scale: number;
  showDay: boolean;
  selectedRange?: SelectedRange;
};

function formatHour(time: number, timezone: string): string {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    hour12: true,
    timeZone: timezone,
  }).format(new Date(time * 1000));
}

export function formatChartDay(time: number, timezone: string): string {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    day: 'numeric',
    timeZone: timezone,
  }).format(new Date(time * 1000));
}

function formatPrecipitation(value: number | null | undefined): string {
  if (value == null) return '-';
  if (value === 0) return '0';
  return value < 0.1 ? value.toFixed(2) : value.toFixed(1);
}

function formatPrecipitationProbability(value: number | null | undefined): string {
  return value == null ? '-' : `${Math.round(value)}%`;
}

export function HourBin({ hour, timezone, scale, showDay, selectedRange }: Props) {
  const height = Math.max(0, hour.uv / scale * MAX_BAR_HEIGHT);
  const isSelected = selectedRange !== undefined &&
    hour.time < selectedRange.end && hour.time + 3600 > selectedRange.start;
  const isContext = selectedRange !== undefined && !isSelected;
  const cloudCoverDescription = hour.cloudCover === null
    ? 'unavailable'
    : `${Math.round(hour.cloudCover)} percent`;
  const precipitationProbabilityDescription = hour.precipitationProbability == null
    ? 'unavailable'
    : `${Math.round(hour.precipitationProbability)} percent`;
  const precipitationDescription = hour.precipitation == null
    ? 'unavailable'
    : `${formatPrecipitation(hour.precipitation)} millimeters`;
  const windSpeedDescription = hour.windSpeed == null
    ? 'unavailable'
    : `${Math.round(hour.windSpeed)} kilometers per hour`;
  const outingDescription = selectedRange
    ? isSelected ? ', during selected outing' : ', outside selected outing'
    : '';

  return (
    <View style={[
      styles.bin,
      selectedRange
        ? isSelected && styles.selectedBin
        : hour.period === 'now' && styles.currentBin,
    ]}
      accessible
      accessibilityLabel={`${formatHour(hour.time, timezone)}. UV Index ${hour.uv.toFixed(1)}. Temperature ${Math.round(hour.temperature)} degrees Celsius. Cloud cover ${cloudCoverDescription}. Precipitation chance ${precipitationProbabilityDescription} for the preceding hour. Precipitation amount ${precipitationDescription} for the preceding hour. Wind speed ${windSpeedDescription}${outingDescription}.`}
      accessibilityRole="text"
    >
      <Text numberOfLines={1} style={[styles.cloudCover, isContext && styles.contextText]}>
        {hour.cloudCover === null ? '-' : `${Math.round(hour.cloudCover)}%`}
      </Text>
      <Text numberOfLines={1} style={[styles.temperature, isContext && styles.contextText]}>
        {Math.round(hour.temperature)}°
      </Text>
      <View style={styles.barArea}>
        <Text numberOfLines={1} style={[styles.uv, isContext && styles.contextText, { bottom: height + 2 }]}>
          {hour.uv.toFixed(1)}
        </Text>
        <View style={[
          styles.bar,
          { height },
          selectedRange
            ? isSelected ? styles.selectedBar : styles.contextBar
            : hour.period === 'past' ? styles.pastBar : hour.period === 'now' ? styles.currentBar : null,
        ]} />
      </View>
      <Text
        numberOfLines={1}
        style={[styles.hour, !selectedRange && hour.period === 'now' && styles.currentText, isContext && styles.contextText]}
      >
        {hour.period === 'now' ? 'Now' : formatHour(hour.time, timezone)}
      </Text>
      <Text numberOfLines={1} style={[styles.day, isContext && styles.contextText]}>
        {showDay ? formatChartDay(hour.time, timezone) : ' '}
      </Text>
      <Text numberOfLines={1} style={[styles.precipitationProbability, isContext && styles.contextText]}>
        {formatPrecipitationProbability(hour.precipitationProbability)}
      </Text>
      <Text numberOfLines={1} style={[styles.precipitation, isContext && styles.contextText]}>
        {formatPrecipitation(hour.precipitation)}
      </Text>
      <Text numberOfLines={1} style={[styles.windSpeed, isContext && styles.contextText]}>
        {hour.windSpeed === null ? '-' : Math.round(hour.windSpeed)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bin: { alignItems: 'center', paddingHorizontal: 1, width: BIN_WIDTH },
  currentBin: { backgroundColor: '#F5F5F5', borderRadius: 5 },
  selectedBin: { backgroundColor: '#F5F5F5', borderRadius: 5 },
  cloudCover: { color: '#767676', fontSize: 9, marginBottom: 1 },
  temperature: { color: '#5F5F5F', fontSize: 11, marginBottom: 2 },
  uv: {
    color: '#151515', fontSize: 12, fontWeight: '500', left: (BAR_WIDTH - BIN_WIDTH) / 2,
    position: 'absolute', textAlign: 'center', width: BIN_WIDTH,
  },
  barArea: {
    borderBottomColor: '#D6D6D6', borderBottomWidth: 1, height: BAR_AREA_HEIGHT,
    justifyContent: 'flex-end', width: BAR_WIDTH,
  },
  bar: { backgroundColor: '#606060', borderRadius: 3, width: BAR_WIDTH },
  pastBar: { backgroundColor: '#999999' },
  currentBar: { backgroundColor: '#222222' },
  selectedBar: { backgroundColor: '#222222' },
  contextBar: { backgroundColor: '#C8C8C8' },
  contextText: { color: '#767676' },
  hour: { color: '#5F5F5F', fontSize: 10, marginTop: 4, textAlign: 'center', width: BIN_WIDTH },
  currentText: { color: '#151515', fontWeight: '600' },
  day: { color: '#767676', fontSize: 9, marginTop: 2, minHeight: 15, textAlign: 'center' },
  precipitationProbability: { color: '#686868', fontSize: 9, marginTop: 5, textAlign: 'center', width: BIN_WIDTH },
  precipitation: { color: '#686868', fontSize: 9, marginTop: 1, textAlign: 'center', width: BIN_WIDTH },
  windSpeed: { color: '#686868', fontSize: 9, marginTop: 1, textAlign: 'center', width: BIN_WIDTH },
});
