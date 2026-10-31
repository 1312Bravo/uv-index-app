import { StyleSheet, Text, View } from 'react-native';

import { uiColors } from '../../ui/visualStyle';

type Props = {
  mode?: 'current' | 'forecast';
  forecastTime?: number;
  temperature: number;
  cloudCover: number | null;
  precipitationProbability?: number | null;
  windSpeed: number | null;
  windGust: number | null;
  precipitation: number | null;
  precipitationInterval?: number | null;
  precipitationTime?: number | null;
  timezone: string;
};

function formatPrecipitation(value: number | null): string {
  if (value === null) return '-';
  return `${value > 0 && value < 0.1 ? value.toFixed(2) : value.toFixed(1)} mm`;
}

function formatWind(value: number | null): string {
  return value == null ? '-' : `${Math.round(value)} km/h`;
}

function formatInterval(interval: number | null): string {
  if (interval === null || interval <= 0) return 'Previous interval';
  const minutes = Math.round(interval / 60);
  if (minutes < 60) return `Previous ${minutes} min`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `Previous ${hours} hr` : `Previous ${minutes} min`;
}

function formatTime(time: number, timezone: string): string {
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

function Metric({ label, value, secondaryValue, description, detail }: {
  label: string;
  value: string;
  secondaryValue?: string;
  description?: string;
  detail?: string | null;
}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {value}
        {secondaryValue !== undefined && <Text style={styles.secondaryValue}> ({secondaryValue})</Text>}
      </Text>
      {description && <Text style={styles.detail}>{description}</Text>}
      {detail && <Text style={styles.detail}>{detail}</Text>}
    </View>
  );
}

export function WeatherMetrics({
  mode = 'current',
  forecastTime,
  temperature,
  cloudCover,
  precipitationProbability,
  windSpeed,
  windGust,
  precipitation,
  precipitationInterval,
  precipitationTime,
  timezone,
}: Props) {
  const isForecast = mode === 'forecast';
  const latestEstimate = precipitationTime == null
    ? null
    : formatTime(precipitationTime, timezone);
  const precipitationRange = precipitationTime == null || precipitationInterval == null
    ? null
    : `${formatTime(precipitationTime - precipitationInterval, timezone)} to ${formatTime(precipitationTime, timezone)}`;
  const latestEstimateDetail = !isForecast && latestEstimate ? `Latest estimate: ${latestEstimate}` : null;
  const precipitationDetail = precipitationRange
    ? `${formatInterval(precipitationInterval ?? null)}: ${precipitationRange}`
    : formatInterval(precipitationInterval ?? null);
  const forecastPrecipitationDetail = precipitationProbability == null
    ? 'Hourly chance unavailable'
    : `Hourly chance: ${Math.round(precipitationProbability)}%`;

  return (
    <View>
      <Text style={styles.heading}>{isForecast ? 'Weather forecast' : 'Current weather'}</Text>
      {isForecast && forecastTime !== undefined && (
        <Text style={styles.forecastTime}>{formatForecastTime(forecastTime, timezone)}</Text>
      )}
      <View style={styles.grid}>
        <View style={styles.row}>
          <Metric
            label="TEMPERATURE"
            value={`${Math.round(temperature)}°C`}
            detail={latestEstimateDetail}
          />
          <View style={styles.divider} />
          <Metric
            label="CLOUD COVER"
            value={cloudCover === null ? '-' : `${Math.round(cloudCover)}%`}
            detail={latestEstimateDetail}
          />
        </View>
        <View style={styles.horizontalDivider} />
        <View style={styles.row}>
          <Metric
            label="PRECIPITATION"
            value={formatPrecipitation(precipitation)}
            detail={isForecast ? forecastPrecipitationDetail : precipitationDetail}
          />
          <View style={styles.divider} />
          <Metric
            label="WIND"
            value={formatWind(windSpeed)}
            secondaryValue={formatWind(windGust)}
            description={isForecast ? 'Hourly gust peak' : 'Wind (gusts)'}
            detail={latestEstimateDetail}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { color: uiColors.ink, fontSize: 14, fontWeight: '600', marginTop: 16, textAlign: 'center' },
  forecastTime: { color: uiColors.muted, fontSize: 11, marginTop: 4, textAlign: 'center' },
  grid: { alignSelf: 'center', marginTop: 8, maxWidth: 900, width: '100%' },
  row: { alignItems: 'stretch', flexDirection: 'row' },
  metric: { alignItems: 'center', flex: 1, justifyContent: 'flex-start', paddingHorizontal: 4, paddingVertical: 7 },
  divider: { alignSelf: 'stretch', backgroundColor: uiColors.line, marginHorizontal: 4, marginVertical: 4, width: 1 },
  horizontalDivider: { backgroundColor: uiColors.line, height: 1, marginVertical: 6 },
  label: { color: uiColors.muted, fontSize: 9, letterSpacing: 0.4, textAlign: 'center' },
  value: { color: uiColors.ink, fontSize: 17, marginTop: 5, textAlign: 'center' },
  secondaryValue: { fontSize: 15 },
  detail: { color: uiColors.muted, fontSize: 10, lineHeight: 14, marginTop: 3, textAlign: 'center' },
});
