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
    ? getProtectionGuidance(summary.highestUv, plan.shade)
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
        <Text style={styles.message}>
          The forecast does not cover these outing hours. Adjust the start time or duration and try again.
        </Text>
      )}
      {forecast && summary && (
        <>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>UV Index</Text>
              <Text style={styles.summaryValue}>{summary.highestUv.toFixed(1)}</Text>
              <Text style={styles.summaryDetail}>Peak · {summary.highestCategory.label}</Text>
              <Text style={styles.summarySecondary}>Average {summary.averageUv.toFixed(1)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Temperature</Text>
              <Text style={styles.summaryValue}>{Math.round(summary.averageTemperature)}°C</Text>
              <Text style={styles.summaryDetail}>Average</Text>
              <Text style={styles.summarySecondary}>Range {formatTemperatureRange(summary)}</Text>
            </View>
          </View>

          {guidance && (
            <View style={styles.guidance}>
              <Text style={styles.subheading}>{guidance.headline}</Text>
              <Text style={styles.guidanceText}>{guidance.explanation}</Text>
              {guidance.actions.map((action) => (
                <Text key={action} style={styles.guidanceAction}>• {action}</Text>
              ))}
              {guidance.shadeMessage && (
                <Text style={styles.shadeMessage}>{guidance.shadeMessage}</Text>
              )}
            </View>
          )}

          <Text style={styles.subheading}>UV, clouds and temperature by hour</Text>
          <HourlyUvBarChart
            hours={forecast.hours}
            timezone={forecast.timezone}
            daylight={forecast.daylight}
            sunTime={plan.start.getTime() / 1000}
            selectedRange={{
              start: plan.start.getTime() / 1000,
              end: plan.end.getTime() / 1000,
            }}
          />
          <Text style={styles.source}>Open-Meteo forecast data</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderTopColor: '#EEEEEE', borderTopWidth: 1, marginTop: 36, paddingTop: 24 },
  heading: { color: '#151515', fontSize: 18, fontWeight: '600', textAlign: 'center' },
  timeRange: { color: '#555555', fontSize: 14, fontWeight: '500', marginTop: 7, textAlign: 'center' },
  loading: { alignSelf: 'center', marginTop: 20 },
  message: { color: '#9C3D32', fontSize: 14, lineHeight: 20, marginTop: 16, textAlign: 'center' },
  summaryGrid: { alignItems: 'stretch', flexDirection: 'row', marginTop: 22 },
  summaryItem: { alignItems: 'center', flex: 1, paddingVertical: 4 },
  summaryDivider: { alignSelf: 'stretch', backgroundColor: '#DDDDDD', marginHorizontal: 14, marginVertical: 3, width: 1 },
  summaryLabel: { color: '#696969', fontSize: 11, letterSpacing: 0.8, textAlign: 'center', textTransform: 'uppercase' },
  summaryValue: { color: '#151515', fontSize: 24, fontWeight: '500', marginTop: 8, textAlign: 'center' },
  summaryDetail: { color: '#696969', fontSize: 12, marginTop: 2, textAlign: 'center' },
  summarySecondary: { color: '#696969', fontSize: 12, marginTop: 8, textAlign: 'center' },
  guidance: { marginTop: 8 },
  guidanceText: { color: '#696969', fontSize: 13, lineHeight: 19, marginTop: 8 },
  guidanceAction: { color: '#333333', fontSize: 13, lineHeight: 19, marginTop: 8 },
  shadeMessage: { color: '#696969', fontSize: 12, lineHeight: 18, marginTop: 12 },
  subheading: { color: '#151515', fontSize: 15, fontWeight: '600', marginTop: 28, textAlign: 'center' },
  source: { color: '#767676', fontSize: 11, marginTop: 14, textAlign: 'center' },
});
