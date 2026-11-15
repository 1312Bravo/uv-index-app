import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { OutingAirQualitySummary as OutingAirQualitySummaryResult } from '../../domain/airQuality/summarizeOutingAirQuality';
import type { LocationCoordinates } from '../../domain/location/locationTypes';
import { getOutingAirQualityDescription } from '../../domain/airQuality/getOutingAirQualityDescription';
import { getEuropeanAqiCategory } from '../../domain/airQuality/getEuropeanAqiCategory';
import { uiColors } from '../../ui/visualStyle';
import { AirQualityForecastPoint } from '../airQuality/AirQualityForecastPoint';

function formatAqiRange(low: number, high: number): string {
  const lowText = Math.round(low).toString();
  const highText = Math.round(high).toString();
  return lowText === highText ? lowText : `${lowText}-${highText}`;
}

function OutingGuidanceText({ takeaway, generalAdvice, sensitiveAdvice }: {
  takeaway: string;
  generalAdvice: string;
  sensitiveAdvice: string;
}) {
  const sharedAdvice = generalAdvice === sensitiveAdvice;
  return (
    <Text style={styles.guidanceText}>
      {takeaway}{'\n'}
      <Text style={styles.adviceLabel}>{sharedAdvice ? 'Everyone: ' : 'Most people: '}</Text>
      {generalAdvice}
      {!sharedAdvice && (
        <>
          {'\n'}
          <Text style={styles.adviceLabel}>Sensitive groups: </Text>
          {sensitiveAdvice}
        </>
      )}
    </Text>
  );
}

export function OutingAirQualitySummary({ summary, loading, error, onRetry, selectedPoint, forecastPoint }: {
  summary: OutingAirQualitySummaryResult | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  selectedPoint: LocationCoordinates;
  forecastPoint: LocationCoordinates | null;
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
      <Text style={styles.heading}>Outing air quality</Text>
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
                <OutingGuidanceText {...guidance} />
              </View>
            </View>
          </View>
          {coveragePercent < 100 && (
            <Text style={styles.note}>
              Air-quality forecast covers {coveragePercent}% of the selected outing.
            </Text>
          )}
          <AirQualityForecastPoint selectedPoint={selectedPoint} forecastPoint={forecastPoint} />
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
  valueColumn: { alignItems: 'center', flexShrink: 0, paddingTop: 4, width: 108 },
  columnDivider: { alignSelf: 'stretch', backgroundColor: uiColors.line, marginHorizontal: 10, width: 1 },
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
  guidanceText: { color: uiColors.body, fontSize: 13, includeFontPadding: false, lineHeight: 19 },
  adviceLabel: { color: uiColors.ink, fontWeight: '600' },
  note: { color: uiColors.muted, fontSize: 11, lineHeight: 16, marginTop: 6, textAlign: 'center' },
});
