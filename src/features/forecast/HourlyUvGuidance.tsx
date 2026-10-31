import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import type { HourlyUvGuidance as HourlyUvGuidanceResult } from '../../domain/guidance/getHourlyUvGuidance';
import { uiColors } from '../../ui/visualStyle';
import { CurrentWeatherMetrics } from './CurrentWeatherMetrics';

function formatEstimateTime(time: number, timezone: string): string {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  }).format(new Date(time * 1000));
}

function formatForecastTime(time: number, timezone: string): string {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  }).format(new Date(time * 1000));
}

export function HourlyUvGuidance({
  guidance,
  estimateTime,
  forecastHourTime,
  isCurrent,
  isInterpolated,
  timezone,
  currentWeather,
}: {
  guidance: HourlyUvGuidanceResult;
  estimateTime: number | null;
  forecastHourTime: number;
  isCurrent: boolean;
  isInterpolated: boolean;
  timezone: string;
  currentWeather?: {
    temperature: number;
    cloudCover: number | null;
    windSpeed: number | null;
    windGust: number | null;
    precipitation: number | null;
    precipitationInterval: number | null;
    precipitationTime: number | null;
    timezone: string;
  };
}) {
  const { width } = useWindowDimensions();
  const isWideWeb = Platform.OS === 'web' && width >= 760;
  const guidancePoints = [guidance.meaning, ...guidance.actions];

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>
        {isCurrent ? <>Current <Text style={styles.uvAccent}>UV</Text></> : <><Text style={styles.uvAccent}>UV</Text> forecast</>}
      </Text>
      {!isCurrent && (
        <Text style={styles.estimateTime}>
          {isInterpolated ? 'Approx. UV for ' : 'Forecast for '}{formatForecastTime(forecastHourTime, timezone)}
        </Text>
      )}
      <View style={styles.reading}>
        <View style={styles.uvBlock}>
          <Text style={[styles.readingLabel, styles.uvIndexLabel]}>UV INDEX</Text>
          <Text style={styles.uvValue}>{guidance.uv.toFixed(1)}</Text>
          <Text style={styles.category}>{guidance.category}</Text>
          {isCurrent && estimateTime !== null && (
            <Text style={styles.currentEstimateTime}>
              Latest estimate: {formatEstimateTime(estimateTime, timezone)}
            </Text>
          )}
        </View>
        <View style={styles.divider} />
        <View style={styles.protection}>
          <Text style={styles.guidanceLabel}><Text style={styles.uvAccent}>UV</Text> guidance</Text>
          <View style={[styles.actions, isWideWeb && styles.webActions]}>
            {guidancePoints.map((point, index) => (
              <View key={index} style={styles.actionRow}>
                <Text style={styles.marker}>-</Text>
                <Text style={styles.actionText}>{point}</Text>
              </View>
            ))}
            {guidance.cloudNote && (
              <View style={styles.actionRow}>
                <Text style={styles.marker}>-</Text>
                <Text style={styles.note}>{guidance.cloudNote}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      {isCurrent && currentWeather && (
        <View style={styles.weatherSection}>
          <CurrentWeatherMetrics {...currentWeather} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderBottomColor: uiColors.line, borderBottomWidth: 1, paddingBottom: 20 },
  heading: { color: uiColors.ink, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  estimateTime: { color: uiColors.muted, fontSize: 12, marginTop: 5, textAlign: 'center' },
  currentEstimateTime: { color: uiColors.muted, fontSize: 11, marginTop: 5, textAlign: 'center' },
  reading: {
    alignSelf: 'center',
    marginTop: 16,
    maxWidth: 900,
    width: '100%',
  },
  uvBlock: { alignItems: 'center', paddingHorizontal: 8 },
  uvValue: { color: uiColors.accent, fontSize: 32, lineHeight: 38, textAlign: 'center' },
  readingLabel: { color: uiColors.muted, fontSize: 10, letterSpacing: 0.6 },
  uvIndexLabel: { color: uiColors.ink },
  guidanceLabel: { color: uiColors.ink, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  uvAccent: { color: uiColors.accent },
  divider: { alignSelf: 'center', backgroundColor: uiColors.line, height: 1, marginVertical: 14, width: 96 },
  weatherSection: { borderTopColor: uiColors.line, borderTopWidth: 1, marginTop: 16 },
  category: { color: uiColors.accent, fontSize: 15, fontWeight: '500' },
  protection: { alignSelf: 'center', maxWidth: 700, width: '100%' },
  actions: { marginTop: 7, rowGap: 5 },
  // Web-only intrinsic sizing keeps the list left-aligned while centering its widest line.
  webActions: { alignSelf: 'center', maxWidth: '100%', width: 'max-content' as any },
  actionRow: { alignItems: 'flex-start', alignSelf: 'stretch', flexDirection: 'row' },
  marker: { color: uiColors.secondary, fontSize: 12, lineHeight: 16, marginRight: 5, width: 8 },
  actionText: { color: uiColors.body, flex: 1, fontSize: 13, lineHeight: 19 },
  note: { color: uiColors.muted, flex: 1, fontSize: 12, lineHeight: 17 },
});
