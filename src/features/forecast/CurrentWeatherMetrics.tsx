import { StyleSheet, Text, View } from 'react-native';

import { uiColors } from '../../ui/visualStyle';

type Props = {
  temperature: number;
  cloudCover: number | null;
  precipitation: number | null;
  precipitationInterval: number | null;
  precipitationTime: number | null;
  timezone: string;
};

function formatPrecipitation(value: number | null): string {
  if (value === null) return '-';
  return `${value > 0 && value < 0.1 ? value.toFixed(2) : value.toFixed(1)} mm`;
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

function Metric({ label, value, detail }: { label: string; value: string; detail?: string | null }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {detail && <Text style={styles.detail}>{detail}</Text>}
    </View>
  );
}

export function CurrentWeatherMetrics({
  temperature,
  cloudCover,
  precipitation,
  precipitationInterval,
  precipitationTime,
  timezone,
}: Props) {
  const latestEstimate = precipitationTime === null
    ? null
    : formatTime(precipitationTime, timezone);
  const precipitationRange = precipitationTime === null || precipitationInterval === null
    ? null
    : `${formatTime(precipitationTime - precipitationInterval, timezone)} to ${formatTime(precipitationTime, timezone)}`;
  const latestEstimateDetail = latestEstimate ? `Latest estimate: ${latestEstimate}` : null;
  const precipitationDetail = precipitationRange
    ? `${formatInterval(precipitationInterval)}: ${precipitationRange}`
    : formatInterval(precipitationInterval);

  return (
    <View>
      <Text style={styles.heading}>Current Weather</Text>
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
        <View style={styles.divider} />
        <Metric
          label="PRECIPITATION"
          value={formatPrecipitation(precipitation)}
          detail={precipitationDetail}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { color: uiColors.ink, fontSize: 14, fontWeight: '600', marginTop: 16, textAlign: 'center' },
  row: { alignItems: 'stretch', flexDirection: 'row', marginTop: 8 },
  metric: { alignItems: 'center', flex: 1, justifyContent: 'flex-start', paddingHorizontal: 2 },
  divider: { alignSelf: 'stretch', backgroundColor: uiColors.line, marginVertical: 4, width: 1 },
  label: { color: uiColors.muted, fontSize: 9, letterSpacing: 0.4, textAlign: 'center' },
  value: { color: uiColors.ink, fontSize: 17, marginTop: 5, textAlign: 'center' },
  detail: { color: uiColors.muted, fontSize: 10, lineHeight: 14, marginTop: 3, textAlign: 'center' },
});
