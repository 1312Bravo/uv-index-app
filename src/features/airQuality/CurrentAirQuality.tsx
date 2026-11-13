import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { CurrentAirQuality as CurrentAirQualityReading } from '../../domain/airQuality/airQualityTypes';
import { getEuropeanAqiCategory } from '../../domain/airQuality/getEuropeanAqiCategory';
import { SourceAttribution } from '../../ui/SourceAttribution';
import { uiColors } from '../../ui/visualStyle';
import { AirQualityCategoryGuidance } from './AirQualityCategoryGuidance';

function formatTime(time: number, timezone: string): string {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  }).format(new Date(time * 1000));
}

export function CurrentAirQuality({
  airQuality,
  loading,
  error,
  onRetry,
}: {
  airQuality: CurrentAirQualityReading | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const category = airQuality ? getEuropeanAqiCategory(airQuality.europeanAqi) : null;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Current air quality</Text>
      {loading && <ActivityIndicator color={uiColors.accent} style={styles.loading} />}
      {error && (
        <View style={styles.unavailable}>
          <Text style={styles.description}>Air-quality estimate unavailable.</Text>
          <Pressable accessibilityRole="button" onPress={onRetry} hitSlop={8}>
            <Text style={styles.retry}>Try again</Text>
          </Pressable>
        </View>
      )}
      {airQuality && category && (
        <View style={styles.reading}>
          <View style={styles.summaryRow}>
            <View style={styles.valueColumn}>
              <Text style={styles.label}>EUROPEAN AQI</Text>
              <Text
                accessibilityLabel={`European AQI ${airQuality.europeanAqi.toFixed(1)}, ${category.label}`}
                style={styles.value}
              >
                {airQuality.europeanAqi.toFixed(1)}
              </Text>
              <Text style={styles.category}>{category.label}</Text>
            </View>
            <View style={styles.columnDivider} />
            <View style={styles.guidanceColumn}>
              <AirQualityCategoryGuidance category={category} />
              <Text style={styles.estimateTime}>
                Latest estimate: {formatTime(airQuality.time, airQuality.timezone)}
              </Text>
            </View>
          </View>
          <View style={styles.attribution}>
            <View style={styles.sourceLinks}>
              <Text style={styles.attributionLabel}>Data: </Text>
              <SourceAttribution
                compact
                label="Open-Meteo"
                url="https://open-meteo.com/en/docs/air-quality-api"
              />
              <Text style={styles.attributionSeparator}>·</Text>
              <SourceAttribution
                compact
                label="CAMS ENSEMBLE"
                url="https://atmosphere.copernicus.eu/"
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { alignItems: 'stretch', marginTop: 15, paddingBottom: 2, width: '100%' },
  heading: { color: uiColors.ink, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  reading: { alignSelf: 'center', marginTop: 8, maxWidth: 520, paddingHorizontal: 8, width: '100%' },
  summaryRow: { alignItems: 'center', flexDirection: 'row', minHeight: 58 },
  valueColumn: { alignItems: 'center', flexShrink: 0, width: 104 },
  columnDivider: { alignSelf: 'stretch', backgroundColor: uiColors.line, marginHorizontal: 12, width: 1 },
  guidanceColumn: { flex: 1, minWidth: 0 },
  label: { color: uiColors.muted, fontSize: 9, letterSpacing: 0.5 },
  value: { color: uiColors.ink, fontSize: 20, lineHeight: 25, marginTop: 3 },
  category: { color: uiColors.ink, fontSize: 13, fontWeight: '500', marginTop: 1 },
  description: { color: uiColors.body, fontSize: 12, lineHeight: 17, textAlign: 'center' },
  estimateTime: { color: uiColors.muted, fontSize: 10, marginTop: 6, textAlign: 'center' },
  attribution: { alignItems: 'center', marginTop: 5 },
  sourceLinks: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  attributionLabel: { color: uiColors.muted, fontSize: 10 },
  attributionSeparator: { color: uiColors.muted, fontSize: 11, marginHorizontal: 5 },
  loading: { marginTop: 10 },
  unavailable: { alignItems: 'center', marginTop: 3 },
  retry: { color: uiColors.muted, fontSize: 11, marginTop: 4, textDecorationLine: 'underline' },
});
