import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { getProtectionGuidance } from '../../domain/guidance/getProtectionGuidance';
import { HourlyUvBarChart } from '../forecast/HourlyUvBarChart';
import { useHourlyForecast } from '../forecast/useHourlyForecast';
import {
  summarizeOutingForecast,
  type OutingForecastSummary,
} from '../../domain/outing/calculateOutingForecast';
import type { TimePlan } from '../../domain/outing/timePlan';

type Props = {
  latitude: number;
  longitude: number;
  plan: TimePlan;
};

function formatTime(time: number, timezone: string): string {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  }).format(new Date(time * 1000));
}

function formatTemperatureRange(summary: OutingForecastSummary): string {
  const low = Math.round(summary.lowestTemperature);
  const high = Math.round(summary.highestTemperature);
  return low === high ? `${low}°C` : `${low}–${high}°C`;
}

export function OutingForecast({ latitude, longitude, plan }: Props) {
  const { forecast, error, loading } = useHourlyForecast(
    latitude,
    longitude,
    'Could not load the forecast for this outing.',
  );

  const summary = forecast ? summarizeOutingForecast(forecast, plan.start, plan.end) : null;
  const guidance = summary
    ? getProtectionGuidance(summary.highestCategory.key, plan.shade)
    : null;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Your outing forecast</Text>
      <Text style={styles.timeRange}>
        {forecast
          ? `${formatTime(plan.start.getTime() / 1000, forecast.timezone)}–${formatTime(plan.end.getTime() / 1000, forecast.timezone)}`
          : 'Loading selected hours'}
      </Text>

      {loading && <ActivityIndicator color="#151515" style={styles.loading} />}
      {error && <Text style={styles.message}>{error}</Text>}
      {forecast && !summary && !loading && (
        <Text style={styles.message}>No hourly forecast is available for the selected outing yet.</Text>
      )}
      {forecast && summary && (
        <>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Highest UV Index</Text>
              <Text style={styles.summaryValue}>{summary.highestUv.toFixed(1)}</Text>
              <Text style={styles.summaryDetail}>{summary.highestCategory.label}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Temperature</Text>
              <Text style={styles.summaryValue}>{formatTemperatureRange(summary)}</Text>
              <Text style={styles.summaryDetail}>Forecast range</Text>
            </View>
          </View>

          {guidance && (
            <View style={styles.guidance}>
              <Text style={styles.subheading}>{guidance.headline}</Text>
              <Text style={styles.guidanceText}>{guidance.explanation}</Text>
              {guidance.actions.map((action) => (
                <Text key={action} style={styles.guidanceAction}>• {action}</Text>
              ))}
              <Text style={styles.shadeMessage}>{guidance.shadeMessage}</Text>
            </View>
          )}

          <Text style={styles.subheading}>UV, clouds and temperature by hour</Text>
          <HourlyUvBarChart hours={summary.hours} timezone={forecast.timezone} />
          <Text style={styles.source}>Open-Meteo forecast data</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderTopColor: '#EEEEEE', borderTopWidth: 1, marginTop: 36, paddingTop: 24 },
  heading: { color: '#151515', fontSize: 18, fontWeight: '600' },
  timeRange: { color: '#696969', fontSize: 13, marginTop: 6 },
  loading: { alignSelf: 'flex-start', marginTop: 20 },
  message: { color: '#9C3D32', fontSize: 14, lineHeight: 20, marginTop: 16 },
  summaryGrid: { flexDirection: 'row', gap: 12, marginTop: 22 },
  summaryItem: { backgroundColor: '#F7F7F7', borderRadius: 8, flex: 1, minHeight: 96, padding: 14 },
  summaryLabel: { color: '#696969', fontSize: 12 },
  summaryValue: { color: '#151515', fontSize: 21, fontWeight: '600', marginTop: 10 },
  summaryDetail: { color: '#696969', fontSize: 12, marginTop: 3 },
  guidance: { marginTop: 8 },
  guidanceText: { color: '#696969', fontSize: 13, lineHeight: 19, marginTop: 8 },
  guidanceAction: { color: '#333333', fontSize: 13, lineHeight: 19, marginTop: 8 },
  shadeMessage: { color: '#696969', fontSize: 12, lineHeight: 18, marginTop: 12 },
  subheading: { color: '#151515', fontSize: 15, fontWeight: '600', marginTop: 28 },
  source: { color: '#999999', fontSize: 11, marginTop: 14 },
});
