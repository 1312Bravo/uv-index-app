import { StyleSheet, Text, View } from 'react-native';

import type { OutingForecastSummary } from '../../domain/outing/calculateOutingForecast';
import { uiColors, uiType } from '../../ui/visualStyle';

export function OutingUvSummary({ summary }: { summary: OutingForecastSummary }) {
  return (
    <View style={styles.uvSummary}>
      <Text style={styles.uvLabel}>HIGHEST HOURLY UV INDEX</Text>
      <Text style={styles.uvValue}>{summary.highestUv.toFixed(1)}</Text>
      <Text style={styles.uvCategory}>{summary.highestCategory.label}</Text>
      <Text style={styles.uvAverage}>
        Average: <Text style={styles.uvAccent}>{summary.averageUv.toFixed(1)}</Text>
      </Text>
    </View>
  );
}

function WeatherMetric({ title, value, description, detail }: {
  title: string;
  value: string;
  description: string;
  detail: string;
}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.label}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}

function formatWindRange(low: number | null, high: number | null): string {
  if (low === null || high === null) return 'unavailable';
  const roundedLow = Math.round(low);
  const roundedHigh = Math.round(high);
  return `${roundedLow === roundedHigh ? roundedLow : `${roundedLow}-${roundedHigh}`} km/h`;
}

function WindMetric({ summary }: { summary: OutingForecastSummary }) {
  const averageWind = summary.averageWindSpeed === null ? '-' : `${Math.round(summary.averageWindSpeed)} km/h`;
  const averageGust = summary.averageHourlyGustPeak === null
    ? '-'
    : `${Math.round(summary.averageHourlyGustPeak)} km/h`;

  return (
    <View style={styles.metric}>
      <Text style={styles.label}>WIND</Text>
      <Text style={[styles.value, styles.windReading]}>
        {averageWind}<Text style={styles.gustValue}> ({averageGust})</Text>
      </Text>
      <Text style={styles.description}>Average (hourly gust peak)</Text>
      <Text style={styles.detail}>
        Range: {formatWindRange(summary.lowestWindSpeed, summary.highestWindSpeed)} ({formatWindRange(summary.lowestHourlyGustPeak, summary.highestHourlyGustPeak)})
      </Text>
    </View>
  );
}

export function OutingWeatherSummary({ summary }: { summary: OutingForecastSummary }) {
  const low = summary.lowestTemperature === null ? null : Math.round(summary.lowestTemperature);
  const high = summary.highestTemperature === null ? null : Math.round(summary.highestTemperature);
  const temperatureRange = low === null || high === null
    ? 'Range unavailable'
    : `Range: ${low === high ? low : `${low}-${high}`}°C`;
  const cloudRange = summary.lowestCloudCover === null || summary.highestCloudCover === null
    ? 'Range unavailable'
    : `Range: ${Math.round(summary.lowestCloudCover)}-${Math.round(summary.highestCloudCover)}%`;
  const amount = summary.expectedPrecipitationMm;
  const precipitation = amount === null
    ? '-'
    : `${amount > 0 && amount < 0.1 ? amount.toFixed(2) : amount.toFixed(1)} mm`;

  return (
    <View style={styles.weatherSummary}>
      <Text style={styles.heading}>Outing weather summary</Text>
      <View style={styles.weatherGrid}>
        <View style={styles.weatherRow}>
          <WeatherMetric
            title="TEMPERATURE"
            value={summary.averageTemperature === null ? '-' : `${Math.round(summary.averageTemperature)}°C`}
            description={summary.averageTemperature === null ? 'Average unavailable' : 'Average'}
            detail={temperatureRange}
          />
          <View style={styles.divider} />
          <WeatherMetric
            title="CLOUD COVER"
            value={summary.averageCloudCover === null ? '-' : `${Math.round(summary.averageCloudCover)}%`}
            description={summary.averageCloudCover === null ? 'Average unavailable' : 'Average'}
            detail={cloudRange}
          />
        </View>
        <View style={styles.horizontalDivider} />
        <View style={styles.weatherRow}>
          <WeatherMetric
            title="EXPECTED PRECIPITATION"
            value={precipitation}
            description={summary.completePrecipitationHours === 0
              ? 'No full forecast hours'
              : amount === null
                ? 'Amount unavailable'
                : `Across ${summary.completePrecipitationHours} complete ${summary.completePrecipitationHours === 1 ? 'hour' : 'hours'}`}
            detail={summary.peakHourlyPrecipitationProbability === null
              ? 'Hourly chance unavailable'
              : `Peak hourly chance: ${Math.round(summary.peakHourlyPrecipitationProbability)}%`}
          />
          <View style={styles.divider} />
          <WindMetric summary={summary} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  uvSummary: { alignItems: 'center', marginTop: 16, marginBottom: 14 },
  uvLabel: { color: uiColors.ink, fontSize: 10, letterSpacing: 0.6, textAlign: 'center' },
  uvValue: { color: uiColors.accent, fontSize: 32, lineHeight: 38, textAlign: 'center' },
  uvCategory: { color: uiColors.accent, fontSize: 15, fontWeight: '500', textAlign: 'center' },
  uvAverage: { color: uiColors.secondary, fontSize: 13, marginTop: 4, textAlign: 'center' },
  uvAccent: { color: uiColors.accent },
  weatherSummary: { borderTopColor: uiColors.line, borderTopWidth: 1, marginTop: 20, paddingTop: 12 },
  heading: { color: uiColors.ink, fontSize: uiType.sectionHeading, fontWeight: '600', textAlign: 'center' },
  weatherGrid: { alignSelf: 'center', marginTop: 12, maxWidth: 900, width: '100%' },
  weatherRow: { alignItems: 'stretch', flexDirection: 'row' },
  metric: { alignItems: 'center', flex: 1, paddingHorizontal: 4, paddingVertical: 7 },
  divider: { alignSelf: 'stretch', backgroundColor: uiColors.line, marginHorizontal: 4, marginVertical: 4, width: 1 },
  horizontalDivider: { backgroundColor: uiColors.line, height: 1, marginVertical: 6 },
  label: { color: uiColors.secondary, fontSize: 9, letterSpacing: 0.4, minHeight: 26, textAlign: 'center' },
  value: { color: uiColors.ink, fontSize: 18, marginTop: 4, textAlign: 'center' },
  windReading: { lineHeight: 22 },
  gustValue: { fontSize: 16 },
  description: { color: uiColors.secondary, fontSize: 11, lineHeight: 15, marginTop: 3, textAlign: 'center' },
  detail: { color: uiColors.secondary, fontSize: 11, lineHeight: 15, marginTop: 4, textAlign: 'center' },
});
