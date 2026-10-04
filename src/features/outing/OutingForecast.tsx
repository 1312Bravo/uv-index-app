import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type { HourlyForecast } from '../forecast/getHourlyForecast';
import { useHourlyForecast } from '../forecast/useHourlyForecast';
import { summarizeOutingForecast, type OutingForecastSummary } from '../../domain/outing/calculateOutingForecast';
import type { TimePlan } from '../planning/TimePlanner';

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

function formatHour(time: number, timezone: string): string {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    hour12: true,
    timeZone: timezone,
  }).format(new Date(time * 1000));
}

function formatTemperatureRange(summary: OutingForecastSummary): string {
  const low = Math.round(summary.lowestTemperature);
  const high = Math.round(summary.highestTemperature);
  return low === high ? `${low}°C` : `${low}–${high}°C`;
}

function ForecastRows({ forecast, summary }: { forecast: HourlyForecast; summary: OutingForecastSummary }) {
  return (
    <View style={styles.rows}>
      <View style={styles.rowHeader}>
        <Text style={styles.rowHeaderText}>Time</Text>
        <Text style={styles.rowHeaderText}>UV Index</Text>
        <Text style={styles.rowHeaderText}>Temperature</Text>
      </View>
      {summary.hours.map((hour) => (
        <View key={hour.time} style={styles.row}>
          <Text style={styles.rowText}>{formatHour(hour.time, forecast.timezone)}</Text>
          <Text style={styles.rowText}>{hour.uv.toFixed(1)}</Text>
          <Text style={styles.rowText}>{Math.round(hour.temperature)}°C</Text>
        </View>
      ))}
    </View>
  );
}

export function OutingForecast({ latitude, longitude, plan }: Props) {
  const { forecast, error, loading } = useHourlyForecast(
    latitude,
    longitude,
    'Could not load the forecast for this outing.',
  );

  const summary = forecast ? summarizeOutingForecast(forecast, plan.start, plan.end) : null;

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

          <Text style={styles.subheading}>UV and temperature by hour</Text>
          <ForecastRows forecast={forecast} summary={summary} />
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
  subheading: { color: '#151515', fontSize: 15, fontWeight: '600', marginTop: 28 },
  rows: { marginTop: 12 },
  rowHeader: { borderBottomColor: '#D6D6D6', borderBottomWidth: 1, flexDirection: 'row', paddingBottom: 8 },
  rowHeaderText: { color: '#999999', flex: 1, fontSize: 11 },
  row: { borderBottomColor: '#EEEEEE', borderBottomWidth: 1, flexDirection: 'row', paddingVertical: 11 },
  rowText: { color: '#151515', flex: 1, fontSize: 13 },
  source: { color: '#999999', fontSize: 11, marginTop: 14 },
});
