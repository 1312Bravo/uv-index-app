import { StyleSheet, Text, View } from 'react-native';

import type { ForecastHour } from '../../domain/forecast/forecastTypes';
import type { HourlyChartLayout, SelectedRange } from './hourlyChartLayout';
import { uiColors } from '../../ui/visualStyle';

const VALUE_BAR_GAP = 16;
const TOP_PADDING = 5;

export function getValueGroupTop(uv: number, scale: number, layout: HourlyChartLayout): number {
  const height = Math.max(0, uv / scale * layout.maxBarHeight);
  const barAreaHeight = layout.maxBarHeight + layout.valueGroupHeight + VALUE_BAR_GAP + TOP_PADDING;
  return barAreaHeight - height - VALUE_BAR_GAP - layout.valueGroupHeight;
}

type Props = {
  hour: ForecastHour;
  timezone: string;
  scale: number;
  valueGroupTop: number;
  showDay: boolean;
  isEndBoundary?: boolean;
  isFirstSelected?: boolean;
  isLastSelected?: boolean;
  selectedRange?: SelectedRange;
  selectedHourTime?: number;
  useHourlyForecast?: boolean;
  uvValue?: number;
  layout: HourlyChartLayout;
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
  hour, timezone, scale, valueGroupTop, showDay, isEndBoundary = false, isFirstSelected = false,
  isLastSelected = false, selectedRange, selectedHourTime, useHourlyForecast = false, uvValue, layout,
}: Props) {
  const { binWidth, barWidth, maxBarHeight, valueGroupHeight } = layout;
  const isDesktop = binWidth > 42;
  const barAreaHeight = maxBarHeight + valueGroupHeight + VALUE_BAR_GAP + TOP_PADDING;
  const columnWidth = { width: binWidth };
  const uv = uvValue ?? (useHourlyForecast ? hour.hourlyUv ?? hour.uv : hour.uv);
  const cloudCover = useHourlyForecast ? hour.hourlyCloudCover ?? hour.cloudCover : hour.cloudCover;
  const height = Math.max(0, uv / scale * maxBarHeight);
  const selectedBackgroundTop = Math.max(0, valueGroupTop - 5);
  const isSelected = selectedRange !== undefined &&
    hour.time < selectedRange.end && hour.time + 3600 > selectedRange.start;
  const isContext = selectedRange !== undefined && !isSelected;
  const isFocused = selectedHourTime === hour.time;
  const showFocusedBackground = selectedRange === undefined && isFocused;
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
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
      style={[styles.bin, columnWidth]}
    >
      {(isSelected || showFocusedBackground) && (
        <View
          pointerEvents="none"
          style={[
            styles.selectedRangeBackground,
            { top: selectedBackgroundTop },
            isFirstSelected && styles.selectedRangeStart,
            isLastSelected && styles.selectedRangeEnd,
            showFocusedBackground && styles.focusedHourBackground,
          ]}
        />
      )}
      <View style={[styles.barArea, { height: barAreaHeight, width: barWidth }]}>
        <View style={[styles.valueGroup, { height: valueGroupHeight, left: (barWidth - binWidth) / 2, top: valueGroupTop, width: binWidth }]}>
          <Text numberOfLines={1} style={[styles.cloudCover, columnWidth, isDesktop && styles.desktopCloudCover, isContext && styles.contextText]}>
            {cloudCover === null ? '-' : `${Math.round(cloudCover)}%`}
          </Text>
          <Text numberOfLines={1} style={[styles.temperature, columnWidth, isDesktop && styles.desktopTemperature, isContext && styles.contextText]}>
            {Math.round(hour.temperature)}°
          </Text>
          <Text numberOfLines={1} style={[styles.uv, columnWidth, isDesktop && styles.desktopUv, isContext && styles.contextText]}>
            {uv.toFixed(1)}
          </Text>
        </View>
        <View style={[
          styles.bar,
          { height, width: barWidth },
          selectedRange
            ? isSelected ? styles.selectedBar : styles.contextBar
            : selectedHourTime !== undefined
              ? isFocused ? styles.currentBar : hour.period === 'past' ? styles.pastBar : null
              : hour.period === 'past' ? styles.pastBar : hour.period === 'now' ? styles.currentBar : null,
        ]} />
      </View>
      <Text
        numberOfLines={1}
        style={[styles.hour, columnWidth, isDesktop && styles.desktopHour, !selectedRange && (selectedHourTime !== undefined ? isFocused : hour.period === 'now') && styles.currentText, isContext && !isEndBoundary && styles.contextText]}
      >
        {hour.period === 'now' && !useHourlyForecast ? 'Now' : formatHour(hour.time, timezone)}
      </Text>
      <Text numberOfLines={1} style={[styles.day, columnWidth, isContext && styles.contextText]}>
        {showDay ? formatChartDay(hour.time, timezone) : ' '}
      </Text>
      <Text numberOfLines={1} style={[styles.precipitationProbability, columnWidth, isDesktop && styles.desktopWeatherValue, isContext && styles.contextText]}>
        {formatPrecipitationProbability(hour.precipitationProbability)}
      </Text>
      <Text numberOfLines={1} style={[styles.precipitation, columnWidth, isDesktop && styles.desktopWeatherValue, isContext && styles.contextText]}>
        {formatPrecipitation(hour.precipitation)}
      </Text>
      <Text numberOfLines={1} style={[styles.windSpeed, columnWidth, isDesktop && styles.desktopWeatherValue, isContext && styles.contextText]}>
        {hour.windSpeed === null ? '-' : Math.round(hour.windSpeed)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bin: { alignItems: 'center', paddingHorizontal: 1, position: 'relative' },
  selectedRangeBackground: {
    backgroundColor: uiColors.soft, bottom: -8, left: 0, position: 'absolute', right: 0,
  },
  focusedHourBackground: { borderRadius: 8 },
  selectedRangeStart: { borderBottomLeftRadius: 8, borderTopLeftRadius: 8 },
  selectedRangeEnd: { borderBottomRightRadius: 8, borderTopRightRadius: 8 },
  valueGroup: {
    alignItems: 'center', position: 'absolute',
  },
  cloudCover: { color: uiColors.muted, fontSize: 10, includeFontPadding: false, lineHeight: 12, textAlign: 'center' },
  desktopCloudCover: { fontSize: 11, lineHeight: 14 },
  temperature: { color: uiColors.secondary, fontSize: 11, includeFontPadding: false, lineHeight: 13, textAlign: 'center' },
  desktopTemperature: { fontSize: 12, lineHeight: 15 },
  uv: { color: uiColors.accent, fontSize: 12, fontWeight: '500', includeFontPadding: false, lineHeight: 15, textAlign: 'center' },
  desktopUv: { fontSize: 14, lineHeight: 17 },
  barArea: {
    borderBottomColor: uiColors.line, borderBottomWidth: 1, justifyContent: 'flex-end',
  },
  bar: { backgroundColor: uiColors.bar, borderRadius: 3 },
  pastBar: { backgroundColor: uiColors.contextBar },
  currentBar: { backgroundColor: uiColors.bar },
  selectedBar: { backgroundColor: uiColors.bar },
  contextBar: { backgroundColor: uiColors.contextBar },
  contextText: { color: uiColors.faint },
  hour: { color: uiColors.secondary, fontSize: 11, marginTop: 4, textAlign: 'center' },
  desktopHour: { fontSize: 12 },
  currentText: { color: uiColors.ink, fontWeight: '600' },
  day: { color: uiColors.muted, fontSize: 10, marginTop: 2, minHeight: 15, textAlign: 'center' },
  precipitationProbability: { color: uiColors.secondary, fontSize: 10, marginTop: 5, textAlign: 'center' },
  precipitation: { color: uiColors.secondary, fontSize: 10, marginTop: 1, textAlign: 'center' },
  windSpeed: { color: uiColors.secondary, fontSize: 10, marginTop: 1, textAlign: 'center' },
  desktopWeatherValue: { fontSize: 11 },
});
