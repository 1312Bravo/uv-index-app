import { StyleSheet, Text, View } from 'react-native';

import type { HourlyUvGuidance as HourlyUvGuidanceResult } from '../../domain/guidance/getHourlyUvGuidance';
import { uiColors } from '../../ui/visualStyle';

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
}: {
  guidance: HourlyUvGuidanceResult;
  estimateTime: number | null;
  forecastHourTime: number;
  isCurrent: boolean;
  isInterpolated: boolean;
  timezone: string;
}) {
  const guidancePoints = [guidance.meaning, ...guidance.actions];

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{isCurrent ? 'Current UV' : 'UV forecast'}</Text>
      {isCurrent && estimateTime !== null && (
        <Text style={styles.estimateTime}>Latest estimate: {formatEstimateTime(estimateTime, timezone)}</Text>
      )}
      {!isCurrent && (
        <Text style={styles.estimateTime}>
          {isInterpolated ? 'Approx. UV for ' : 'Forecast for '}{formatForecastTime(forecastHourTime, timezone)}
        </Text>
      )}
      <View style={styles.reading}>
        <View style={styles.uvBlock}>
          <Text style={styles.readingLabel}>UV INDEX</Text>
          <Text style={styles.uvValue}>{guidance.uv.toFixed(1)}</Text>
          <Text style={styles.category}>{guidance.category}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.protection}>
          <Text style={[styles.readingLabel, styles.guidanceLabel]}>GUIDANCE</Text>
          <View style={styles.actions}>
            {guidancePoints.map((point, index) => (
              <View key={index} style={styles.actionRow}>
                <Text style={styles.marker}>-</Text>
                <Text style={styles.actionText}>{point}</Text>
              </View>
            ))}
          </View>
          {guidance.cloudNote && (
            <View style={styles.noteRow}>
              <Text style={styles.marker}>-</Text>
              <Text style={styles.note}>{guidance.cloudNote}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.notes}>
        {guidance.categoryNote && <Text style={styles.note}>{guidance.categoryNote}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderBottomColor: uiColors.line, borderBottomWidth: 1, paddingBottom: 20 },
  heading: { color: uiColors.ink, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  estimateTime: { color: uiColors.muted, fontSize: 12, marginTop: 5, textAlign: 'center' },
  reading: { alignItems: 'stretch', flexDirection: 'row', marginTop: 16 },
  uvBlock: { alignItems: 'center', flex: 0.85, justifyContent: 'flex-start', paddingHorizontal: 8 },
  uvValue: { color: uiColors.ink, fontSize: 32, lineHeight: 38, textAlign: 'center' },
  readingLabel: { color: uiColors.muted, fontSize: 10, letterSpacing: 0.6 },
  guidanceLabel: { textAlign: 'center' },
  divider: { alignSelf: 'stretch', backgroundColor: uiColors.line, marginVertical: 4, width: 1 },
  category: { color: uiColors.body, fontSize: 15, fontWeight: '500' },
  protection: { flex: 1.4, paddingLeft: 12 },
  actions: { marginTop: 7, rowGap: 5 },
  noteRow: { alignItems: 'flex-start', flexDirection: 'row', marginTop: 5 },
  actionRow: { alignItems: 'flex-start', flexDirection: 'row' },
  marker: { color: '#555555', fontSize: 12, lineHeight: 16, marginRight: 5, width: 8 },
  actionText: { color: uiColors.body, flex: 1, fontSize: 13, lineHeight: 19 },
  notes: { marginTop: 8 },
  note: { color: uiColors.muted, flex: 1, fontSize: 12, lineHeight: 17 },
});
