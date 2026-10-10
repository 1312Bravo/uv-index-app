import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { getUvScoutInsight, type UvScoutInsightItem } from '../../domain/guidance/getUvScoutInsight';
import { HourlyUvBarChart } from '../forecast/HourlyUvBarChart';
import { useHourlyForecast } from '../forecast/useHourlyForecast';
import {
  summarizeOutingForecast,
  type OutingForecastSummary,
} from '../../domain/outing/calculateOutingForecast';
import type { TimePlan } from '../../domain/outing/timePlan';
import type { HourlyForecast } from '../../domain/forecast/forecastTypes';

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

function formatDate(time: number, timezone: string): string {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  }).format(new Date(time * 1000));
}

function formatDateTimeRange(start: number, end: number, timezone: string): string {
  const dateFormatter = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: timezone,
  });
  const sameDate = dateFormatter.format(new Date(start * 1000)) ===
    dateFormatter.format(new Date(end * 1000));

  return sameDate
    ? `${formatDate(start, timezone)} · ${formatTime(start, timezone)}–${formatTime(end, timezone)}`
    : `${formatDate(start, timezone)}, ${formatTime(start, timezone)} – ${formatDate(end, timezone)}, ${formatTime(end, timezone)}`;
}

function getForecastLimitMessage(forecast: HourlyForecast, outingEnd: Date): string | null {
  const lastHour = forecast.hours[forecast.hours.length - 1];
  if (!lastHour) return null;

  const forecastEnd = lastHour.time + 3600;
  if (outingEnd.getTime() / 1000 <= forecastEnd) return null;

  return `The forecast is available through ${formatDate(forecastEnd, forecast.timezone)} at ${formatTime(forecastEnd, forecast.timezone)}. Adjust the outing time or duration to see its full forecast.`;
}

function formatTemperatureRange(summary: OutingForecastSummary): string {
  const low = Math.round(summary.lowestTemperature);
  const high = Math.round(summary.highestTemperature);
  return low === high ? `${low}°C` : `${low}–${high}°C`;
}

function formatCloudCoverRange(summary: OutingForecastSummary): string {
  if (summary.lowestCloudCover === null || summary.highestCloudCover === null) return 'Range unavailable';
  return `Range ${Math.round(summary.lowestCloudCover)}–${Math.round(summary.highestCloudCover)}%`;
}

function formatPrecipitationAmount(value: number | null): string {
  if (value === null) return '—';
  return `${value > 0 && value < 0.1 ? value.toFixed(2) : value.toFixed(1)} mm`;
}

function SummaryMetric({ title, mainValue, description, secondaryValue }: {
  title: string;
  mainValue: string;
  description: string;
  secondaryValue: string;
}) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{title}</Text>
      <Text style={styles.summaryValue}>{mainValue}</Text>
      <Text style={styles.summaryDetail}>{description}</Text>
      <Text style={styles.summarySecondary}>{secondaryValue}</Text>
    </View>
  );
}

function GuidanceBullet({ item }: { item: UvScoutInsightItem }) {
  return (
    <View style={styles.guidanceBullet}>
      <Text style={styles.guidanceBulletMarker}>•</Text>
      <Text style={styles.guidanceBulletText}>
        <Text style={styles.guidanceBulletTitle}>{item.title}: </Text>
        {item.text}
      </Text>
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
  const guidance = summary ? getUvScoutInsight(summary, forecast?.timezone ?? 'UTC') : null;
  const forecastLimitMessage = forecast ? getForecastLimitMessage(forecast, plan.end) : null;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Your outing forecast</Text>
      <Text style={styles.timeRange}>
        {forecast
          ? formatDateTimeRange(plan.start.getTime() / 1000, plan.end.getTime() / 1000, forecast.timezone)
          : 'Loading selected hours'}
      </Text>
      {summary && forecastLimitMessage && (
        <Text style={styles.coverageNote}>{forecastLimitMessage}</Text>
      )}

      {loading && <ActivityIndicator color="#151515" style={styles.loading} />}
      {error && <Text style={styles.message}>{error}</Text>}
      {forecast && !summary && !loading && (
        <Text style={styles.message}>
          {forecastLimitMessage ?? 'The forecast does not cover these outing hours. Adjust the start time or duration and try again.'}
        </Text>
      )}
      {forecast && summary && (
        <>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryRow}>
              <SummaryMetric
                title="UV INDEX"
                mainValue={summary.highestUv.toFixed(1)}
                description={`Category: ${summary.highestCategory.label}`}
                secondaryValue={`Average: ${summary.averageUv.toFixed(1)}`}
              />
              <View style={styles.summaryDivider} />
              <SummaryMetric
                title="TEMPERATURE"
                mainValue={`${Math.round(summary.averageTemperature)}°C`}
                description="Average"
                secondaryValue={`Range: ${formatTemperatureRange(summary)}`}
              />
            </View>
            <View style={styles.summaryHorizontalDivider} />
            <View style={styles.summaryRow}>
              <SummaryMetric
                title="CLOUD COVER"
                mainValue={summary.averageCloudCover === null ? '—' : `${Math.round(summary.averageCloudCover)}%`}
                description={summary.averageCloudCover === null ? 'Average unavailable' : 'Average'}
                secondaryValue={formatCloudCoverRange(summary)}
              />
              <View style={styles.summaryDivider} />
              <SummaryMetric
                title="EXPECTED PRECIPITATION"
                mainValue={formatPrecipitationAmount(summary.expectedPrecipitationMm)}
                description={summary.completePrecipitationHours === 0
                  ? 'No full forecast hours'
                  : summary.expectedPrecipitationMm === null
                    ? 'Amount unavailable'
                    : `Across ${summary.completePrecipitationHours} complete ${summary.completePrecipitationHours === 1 ? 'hour' : 'hours'}`}
                secondaryValue={summary.peakHourlyPrecipitationProbability === null
                  ? 'Hourly chance unavailable'
                  : `Peak hourly chance: ${Math.round(summary.peakHourlyPrecipitationProbability)}%`}
              />
            </View>
          </View>

          {guidance && (
            <View style={styles.guidance}>
              <Text style={styles.guidanceTitle}>UV guidance for outing</Text>
              <View style={styles.scoutInsight}>
                <Text style={styles.guidanceGroupHeading}>UV Scout insight</Text>
                <Text style={[styles.guidanceNote, styles.guidanceBodyParagraph]}>
                  {guidance.note}
                </Text>
                {guidance.coverageMessage && (
                  <Text style={[styles.guidanceBody, styles.guidanceBodyParagraph]}>
                    {guidance.coverageMessage}
                  </Text>
                )}
                <Text style={[styles.guidanceBody, styles.guidanceBodyParagraph]}>
                  <Text style={styles.guidanceOverallLabel}>Overall: </Text>
                  {guidance.headline} {guidance.explanation}
                </Text>
                <View style={styles.insightList}>
                  {guidance.profileDetails.map((item, index) => (
                    <GuidanceBullet key={`profile-${index}`} item={item} />
                  ))}
                  {guidance.practicalGuidance.map((item, index) => (
                    <GuidanceBullet key={`action-${index}`} item={item} />
                  ))}
                  {guidance.reapplicationReminder && <GuidanceBullet item={guidance.reapplicationReminder} />}
                </View>
              </View>
            </View>
          )}

          <Text style={styles.subheading}>UV &amp; weather by hour</Text>
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
  coverageNote: { color: '#777777', fontSize: 12, lineHeight: 18, marginTop: 9, textAlign: 'center' },
  loading: { alignSelf: 'center', marginTop: 20 },
  message: { color: '#9C3D32', fontSize: 14, lineHeight: 20, marginTop: 16, textAlign: 'center' },
  summaryGrid: { marginTop: 16 },
  summaryRow: { alignItems: 'stretch', flexDirection: 'row' },
  summaryItem: { alignItems: 'center', flex: 1, justifyContent: 'flex-start', paddingHorizontal: 4, paddingVertical: 7 },
  summaryDivider: { alignSelf: 'stretch', backgroundColor: '#DDDDDD', marginHorizontal: 7, marginVertical: 5, width: 1 },
  summaryHorizontalDivider: { backgroundColor: '#E5E5E5', height: 1 },
  summaryLabel: { color: '#696969', fontSize: 9, letterSpacing: 0.5, minHeight: 24, textAlign: 'center', textTransform: 'uppercase' },
  summaryValue: { color: '#151515', fontSize: 18, marginTop: 4, textAlign: 'center' },
  summaryDetail: { color: '#696969', fontSize: 11, marginTop: 2, textAlign: 'center' },
  summarySecondary: { color: '#696969', fontSize: 13, marginTop: 4, textAlign: 'center' },
  guidance: { marginTop: 12 },
  guidanceTitle: { color: '#151515', fontSize: 17, fontWeight: '600', textAlign: 'center' },
  scoutInsight: { paddingTop: 14 },
  guidanceGroupHeading: { color: '#151515', fontSize: 14, fontWeight: '600', lineHeight: 19 },
  guidanceBody: { color: '#555555', fontSize: 13, lineHeight: 19 },
  guidanceNote: { color: '#929292', fontSize: 11, lineHeight: 16 },
  guidanceBodyParagraph: { marginTop: 6 },
  insightList: { marginTop: 6 },
  guidanceBullet: { alignItems: 'flex-start', flexDirection: 'row', marginTop: 5 },
  guidanceBulletMarker: { color: '#555555', fontSize: 14, lineHeight: 19, marginRight: 8, width: 10 },
  guidanceBulletText: { color: '#555555', flex: 1, fontSize: 13, lineHeight: 19 },
  guidanceBulletTitle: { color: '#333333', fontWeight: '600' },
  guidanceOverallLabel: { color: '#333333', fontWeight: '600' },
  subheading: { color: '#151515', fontSize: 15, fontWeight: '600', marginTop: 28, textAlign: 'center' },
  source: { color: '#767676', fontSize: 11, marginTop: 14, textAlign: 'center' },
});
