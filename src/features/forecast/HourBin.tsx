import { StyleSheet, Text, View } from 'react-native';

import type { ForecastHour } from '../../domain/forecast/forecastTypes';
import { BIN_WIDTH, type SelectedRange } from './hourlyChartLayout';

const BAR_WIDTH = 16;
const MAX_BAR_HEIGHT = 58;
const VALUE_GROUP_HEIGHT = 40;
const VALUE_BAR_GAP = 16;
const TOP_PADDING = 5;
const BAR_AREA_HEIGHT = MAX_BAR_HEIGHT + VALUE_GROUP_HEIGHT + VALUE_BAR_GAP + TOP_PADDING;

type Props = {
  hour: ForecastHour;
  timezone: string;
  scale: number;
  showDay: boolean;
  selectedRange?: SelectedRange;
  selectedHourTime?: number;
  useHourlyForecast?: boolean;
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

export function HourBin({
  hour, timezone, scale, showDay, selectedRange, selectedHourTime, useHourlyForecast = false,
}: Props) {
  const uv = useHourlyForecast ? hour.hourlyUv ?? hour.uv : hour.uv;
  const cloudCover = useHourlyForecast ? hour.hourlyCloudCover ?? hour.cloudCover : hour.cloudCover;
  const height = Math.max(0, uv / scale * MAX_BAR_HEIGHT);
  const isSelected = selectedRange !== undefined &&
    hour.time < selectedRange.end && hour.time + 3600 > selectedRange.start;
  const isContext = selectedRange !== undefined && !isSelected;
  const isFocused = selectedHourTime === hour.time;
  const cloudCoverDescription = cloudCover === null
    ? 'unavailable'
    : `${Math.round(cloudCover)} percent`;
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

  const accessibilityLabel = `${formatChartDay(hour.time, timezone)}, ${formatHour(hour.time, timezone)}. UV Index ${uv.toFixed(1)}. Temperature ${Math.round(hour.temperature)} degrees Celsius. Cloud cover ${cloudCoverDescription}. Precipitation chance ${precipitationProbabilityDescription} for the preceding hour. Precipitation amount ${precipitationDescription} for the preceding hour. Wind speed ${windSpeedDescription}${outingDescription}.`;
  return (
    <View accessible accessibilityLabel={accessibilityLabel} accessibilityRole="text" style={styles.bin}>
      <View style={styles.barArea}>
        <View style={[styles.valueGroup, { bottom: height + VALUE_BAR_GAP }]}>
          <Text numberOfLines={1} style={[styles.cloudCover, isContext && styles.contextText]}>
            {cloudCover === null ? '-' : `${Math.round(cloudCover)}%`}
          </Text>
          <Text numberOfLines={1} style={[styles.temperature, isContext && styles.contextText]}>
            {Math.round(hour.temperature)}°
          </Text>
          <Text numberOfLines={1} style={[styles.uv, isContext && styles.contextText]}>
            {uv.toFixed(1)}
          </Text>
        </View>
        <View style={[
          styles.bar,
          { height },
          selectedRange
            ? isSelected ? styles.selectedBar : styles.contextBar
            : selectedHourTime !== undefined
              ? isFocused ? styles.currentBar : hour.period === 'past' ? styles.pastBar : null
              : hour.period === 'past' ? styles.pastBar : hour.period === 'now' ? styles.currentBar : null,
        ]} />
      </View>
      <Text
        numberOfLines={1}
        style={[styles.hour, !selectedRange && (selectedHourTime !== undefined ? isFocused : hour.period === 'now') && styles.currentText, isContext && styles.contextText]}
      >
        {hour.period === 'now' && !useHourlyForecast ? 'Now' : formatHour(hour.time, timezone)}
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
  valueGroup: {
    alignItems: 'center', height: VALUE_GROUP_HEIGHT, left: (BAR_WIDTH - BIN_WIDTH) / 2,
    position: 'absolute', width: BIN_WIDTH,
  },
  cloudCover: { color: '#767676', fontSize: 10, includeFontPadding: false, lineHeight: 12, textAlign: 'center', width: BIN_WIDTH },
  temperature: { color: '#5F5F5F', fontSize: 11, includeFontPadding: false, lineHeight: 13, textAlign: 'center', width: BIN_WIDTH },
  uv: { color: '#151515', fontSize: 12, fontWeight: '500', includeFontPadding: false, lineHeight: 15, textAlign: 'center', width: BIN_WIDTH },
  barArea: {
    borderBottomColor: '#D6D6D6', borderBottomWidth: 1, height: BAR_AREA_HEIGHT,
    justifyContent: 'flex-end', width: BAR_WIDTH,
  },
  bar: { backgroundColor: '#606060', borderRadius: 3, width: BAR_WIDTH },
  pastBar: { backgroundColor: '#999999' },
  currentBar: { backgroundColor: '#222222' },
  selectedBar: { backgroundColor: '#222222' },
  contextBar: { backgroundColor: '#C8C8C8' },
  contextText: { color: '#A0A0A0' },
  hour: { color: '#5F5F5F', fontSize: 11, marginTop: 4, textAlign: 'center', width: BIN_WIDTH },
  currentText: { color: '#151515', fontWeight: '600' },
  day: { color: '#767676', fontSize: 10, marginTop: 2, minHeight: 15, textAlign: 'center' },
  precipitationProbability: { color: '#686868', fontSize: 10, marginTop: 5, textAlign: 'center', width: BIN_WIDTH },
  precipitation: { color: '#686868', fontSize: 10, marginTop: 1, textAlign: 'center', width: BIN_WIDTH },
  windSpeed: { color: '#686868', fontSize: 10, marginTop: 1, textAlign: 'center', width: BIN_WIDTH },
});
