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
      <Text style={styles.heading}>{isCurrent ? 'Current UV' : 'UV forecast'}</Text>
      {!isCurrent && (
        <Text style={styles.estimateTime}>
          {isInterpolated ? 'Approx. UV for ' : 'Forecast for '}{formatForecastTime(forecastHourTime, timezone)}
        </Text>
      )}
      <View style={[styles.reading, isWideWeb && styles.webReading]}>
        <View style={[styles.uvBlock, isWideWeb && styles.webUvBlock]}>
          <Text style={styles.readingLabel}>UV INDEX</Text>
          <Text style={styles.uvValue}>{guidance.uv.toFixed(1)}</Text>
          <Text style={styles.category}>{guidance.category}</Text>
          {isCurrent && estimateTime !== null && (
            <Text style={styles.currentEstimateTime}>
              Latest estimate: {formatEstimateTime(estimateTime, timezone)}
            </Text>
          )}
        </View>
        <View style={[styles.divider, isWideWeb && styles.webDivider]} />
        <View style={[styles.protection, isWideWeb && styles.webProtection]}>
          <Text style={[styles.readingLabel, styles.guidanceLabel]}>GUIDANCE</Text>
          <View style={[styles.actions, isWideWeb && styles.webActions]}>
            {guidancePoints.map((point, index) => isWideWeb ? (
              <View key={index} style={styles.webActionRow}>
                <Text style={styles.marker}>-</Text>
                <Text style={[styles.actionText, styles.webActionCopy]}>{point}</Text>
              </View>
            ) : (
              <View key={index} style={styles.actionRow}>
                <Text style={styles.marker}>-</Text>
                <Text style={styles.actionText}>{point}</Text>
              </View>
            ))}
          </View>
          {guidance.cloudNote && (
            isWideWeb
              ? (
                <View style={styles.webNoteRow}>
                  <Text style={styles.marker}>-</Text>
                  <Text style={[styles.note, styles.webActionCopy]}>{guidance.cloudNote}</Text>
                </View>
              )
              : (
                <View style={styles.noteRow}>
                  <Text style={styles.marker}>-</Text>
                  <Text style={styles.note}>{guidance.cloudNote}</Text>
                </View>
              )
          )}
        </View>
      </View>
      <View style={styles.notes}>
        {guidance.categoryNote && (
          <Text style={[styles.note, isWideWeb && styles.webCategoryNote]}>
            {guidance.categoryNote}
          </Text>
        )}
      </View>
      {isCurrent && currentWeather && <CurrentWeatherMetrics {...currentWeather} />}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderBottomColor: uiColors.line, borderBottomWidth: 1, paddingBottom: 20 },
  heading: { color: uiColors.ink, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  estimateTime: { color: uiColors.muted, fontSize: 12, marginTop: 5, textAlign: 'center' },
  currentEstimateTime: { color: uiColors.muted, fontSize: 11, marginTop: 5, textAlign: 'center' },
  reading: { alignItems: 'stretch', flexDirection: 'row', marginTop: 16 },
  webReading: {
    alignSelf: 'center',
    flexDirection: 'column',
    maxWidth: 900,
    width: '100%',
  },
  uvBlock: { alignItems: 'center', flex: 0.85, justifyContent: 'flex-start', paddingHorizontal: 8 },
  webUvBlock: { flexBasis: 'auto', flexGrow: 0, flexShrink: 0, width: '100%' },
  uvValue: { color: uiColors.ink, fontSize: 32, lineHeight: 38, textAlign: 'center' },
  readingLabel: { color: uiColors.muted, fontSize: 10, letterSpacing: 0.6 },
  guidanceLabel: { textAlign: 'center' },
  divider: { alignSelf: 'stretch', backgroundColor: uiColors.line, marginVertical: 4, width: 1 },
  webDivider: { height: 1, marginVertical: 14, width: '100%' },
  category: { color: uiColors.body, fontSize: 15, fontWeight: '500' },
  protection: { flex: 1.4, paddingLeft: 12 },
  webProtection: {
    flexBasis: 'auto',
    flexGrow: 0,
    flexShrink: 0,
    paddingLeft: 0,
    width: '100%',
  },
  actions: { marginTop: 7, rowGap: 5 },
  // Web-only intrinsic sizing keeps the list left-aligned while centering its widest line.
  webActions: { alignSelf: 'center', maxWidth: '100%', width: 'max-content' as any },
  webActionRow: { alignSelf: 'stretch', flexDirection: 'row' },
  webActionCopy: { flex: 1, textAlign: 'left' },
  webNoteRow: {
    alignSelf: 'center',
    flexDirection: 'row',
    marginTop: 5,
    maxWidth: '100%',
    width: 'max-content' as any,
  },
  noteRow: { alignItems: 'flex-start', flexDirection: 'row', marginTop: 5 },
  actionRow: { alignItems: 'flex-start', flexDirection: 'row' },
  marker: { color: '#555555', fontSize: 12, lineHeight: 16, marginRight: 5, width: 8 },
  actionText: { color: uiColors.body, flex: 1, fontSize: 13, lineHeight: 19 },
  notes: { marginTop: 8 },
  note: { color: uiColors.muted, flex: 1, fontSize: 12, lineHeight: 17 },
  webCategoryNote: { textAlign: 'center' },
});
