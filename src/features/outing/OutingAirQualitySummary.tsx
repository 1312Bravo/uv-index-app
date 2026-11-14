import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { OutingAirQualitySummary as OutingAirQualitySummaryResult } from '../../domain/airQuality/summarizeOutingAirQuality';
import { getOutingAirQualityDescription } from '../../domain/airQuality/getOutingAirQualityDescription';
import { getEuropeanAqiCategory } from '../../domain/airQuality/getEuropeanAqiCategory';
import { uiColors } from '../../ui/visualStyle';
import { AirQualitySourceAttribution } from '../airQuality/AirQualitySourceAttribution';

function formatAqiRange(low: number, high: number): string {
  const lowText = Math.round(low).toString();
  const highText = Math.round(high).toString();
  return lowText === highText ? lowText : `${lowText}-${highText}`;
}

export function OutingAirQualitySummary({ summary, loading, error, onRetry }: {
  summary: OutingAirQualitySummaryResult | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const peakCategory = summary ? getEuropeanAqiCategory(summary.peakAqi) : null;
  const averageCategory = summary ? getEuropeanAqiCategory(summary.averageAqi) : null;
  const guidance = summary && averageCategory && peakCategory
    ? getOutingAirQualityDescription(summary, averageCategory, peakCategory)
    : null;
  const coveragePercent = summary ? Math.round(summary.coverageFraction * 100) : 0;

  return (
    <View style={styles.section}>
      <View style={styles.divider} />
      <Text style={styles.heading}>Air quality during outing</Text>
      {loading && <ActivityIndicator color={uiColors.accent} style={styles.loading} />}
      {error && (
        <View style={styles.unavailable}>
          <Text style={styles.message}>Air-quality forecast unavailable.</Text>
          <Pressable accessibilityRole="button" onPress={onRetry} hitSlop={8}>
            <Text style={styles.retry}>Try again</Text>
          </Pressable>
        </View>
      )}
      {!loading && !error && !summary && (
        <Text style={styles.message}>No air-quality forecast is available for these outing hours.</Text>
      )}
      {summary && peakCategory && averageCategory && guidance && (
        <View style={styles.content}>
          <View style={styles.summaryRow}>
            <View style={styles.valueColumn}>
              <Text style={styles.label}>EUROPEAN AQI</Text>
              <Text style={styles.value}>
                {summary.averageAqi.toFixed(1)}
                <Text style={styles.peakValue}> ({summary.peakAqi.toFixed(1)})</Text>
              </Text>
              <Text style={styles.description}>Average (peak)</Text>
              <Text style={styles.range}>
                Range: {formatAqiRange(summary.lowestAqi, summary.peakAqi)}
              </Text>
            </View>
            <View style={styles.columnDivider} />
            <View style={styles.categoryColumn}>
              <View style={styles.categoryRows}>
                <Text style={styles.categoryRow}>
                  <Text style={styles.categoryLabel}>Average: </Text>
                  <Text style={styles.category}>{averageCategory.label}</Text>
                </Text>
                <Text style={styles.categoryRow}>
                  <Text style={styles.categoryLabel}>Peak: </Text>
                  <Text style={styles.category}>{peakCategory.label}</Text>
                </Text>
              </View>
              <View style={styles.guidance}>
                <Text style={styles.takeaway}>{guidance.takeaway}</Text>
                {guidance.generalAdvice === guidance.sensitiveAdvice ? (
                  <Text style={styles.advice}>
                    <Text style={styles.adviceLabel}>Everyone: </Text>{guidance.generalAdvice}
                  </Text>
                ) : (
                  <>
                    <Text style={styles.advice}>
                      <Text style={styles.adviceLabel}>Most people: </Text>{guidance.generalAdvice}
                    </Text>
                    <Text style={styles.advice}>
                      <Text style={styles.adviceLabel}>Sensitive groups: </Text>{guidance.sensitiveAdvice}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>
          {coveragePercent < 100 && (
            <Text style={styles.note}>
              Air-quality forecast covers {coveragePercent}% of the selected outing.
            </Text>
          )}
          <View style={styles.attribution}>
            <AirQualitySourceAttribution />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 16, width: '100%' },
  divider: { alignSelf: 'stretch', backgroundColor: uiColors.line, height: 1 },
  heading: { color: uiColors.ink, fontSize: 14, fontWeight: '600', marginTop: 14, textAlign: 'center' },
  loading: { marginTop: 10 },
  unavailable: { alignItems: 'center', marginTop: 6 },
  message: { color: uiColors.muted, fontSize: 12, lineHeight: 17, marginTop: 6, textAlign: 'center' },
  retry: { color: uiColors.muted, fontSize: 11, marginTop: 4, textDecorationLine: 'underline' },
  content: { alignSelf: 'center', marginTop: 8, maxWidth: 520, paddingHorizontal: 8, width: '100%' },
  summaryRow: { alignItems: 'stretch', flexDirection: 'row', minHeight: 58 },
  valueColumn: { alignItems: 'center', flexShrink: 0, justifyContent: 'center', width: 116 },
  columnDivider: { alignSelf: 'stretch', backgroundColor: uiColors.line, marginHorizontal: 12, width: 1 },
  categoryColumn: { flex: 1, justifyContent: 'center', minWidth: 0, paddingLeft: 2 },
  label: { color: uiColors.muted, fontSize: 9, letterSpacing: 0.4, textAlign: 'center' },
  value: { color: uiColors.ink, fontSize: 20, lineHeight: 25, marginTop: 3, textAlign: 'center' },
  peakValue: { fontSize: 15 },
  description: { color: uiColors.secondary, fontSize: 11, lineHeight: 15, marginTop: 3, textAlign: 'center' },
  range: { color: uiColors.secondary, fontSize: 11, lineHeight: 15, marginTop: 4, textAlign: 'center' },
  categoryRows: { rowGap: 5 },
  categoryRow: { lineHeight: 17 },
  categoryLabel: { color: uiColors.secondary, fontSize: 11 },
  category: { color: uiColors.ink, fontSize: 12, fontWeight: '500' },
  guidance: { marginTop: 10 },
  takeaway: { color: uiColors.body, fontSize: 11, lineHeight: 16 },
  advice: { color: uiColors.body, fontSize: 11, lineHeight: 16, marginTop: 6 },
  adviceLabel: { color: uiColors.ink, fontWeight: '600' },
  note: { color: uiColors.muted, fontSize: 11, lineHeight: 16, marginTop: 6, textAlign: 'center' },
  attribution: { alignItems: 'center', marginTop: 5 },
});
