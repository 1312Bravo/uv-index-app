import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { getUvScoutInsight, type UvScoutInsightItem } from '../../domain/guidance/getUvScoutInsight';
import { HourlyUvBarChart } from '../forecast/HourlyUvBarChart';
import { ForecastError } from '../forecast/ForecastError';
import { useHourlyForecast } from '../forecast/useHourlyForecast';
import {
  summarizeOutingForecast,
  type OutingForecastSummary,
} from '../../domain/outing/calculateOutingForecast';
import type { TimePlan } from '../../domain/outing/timePlan';
import type { HourlyForecast } from '../../domain/forecast/forecastTypes';
import { OutingUvTimeline } from './OutingUvTimeline';

type Props = {
  latitude: number;
  longitude: number;
  onTimezoneChange: (timeZone: string) => void;
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
    ? `${formatDate(start, timezone)}, ${formatTime(start, timezone)}-${formatTime(end, timezone)}`
    : `${formatDate(start, timezone)}, ${formatTime(start, timezone)} - ${formatDate(end, timezone)}, ${formatTime(end, timezone)}`;
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
  return low === high ? `${low}°C` : `${low}-${high}°C`;
}

function formatCloudCoverRange(summary: OutingForecastSummary): string {
  if (summary.lowestCloudCover === null || summary.highestCloudCover === null) return 'Range unavailable';
  return `Range ${Math.round(summary.lowestCloudCover)}-${Math.round(summary.highestCloudCover)}%`;
}

function formatPrecipitationAmount(value: number | null): string {
  if (value === null) return '-';
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
      <Text style={styles.guidanceBulletMarker}>-</Text>
      <View style={styles.guidanceBulletContent}>
        <Text style={styles.guidanceBulletText}>
          <Text style={styles.guidanceBulletTitle}>{item.title}{item.text ? ': ' : ''}</Text>
          {item.text}
        </Text>
        {item.subItems?.map((text, index) => (
          <Text key={`sub-${index}`} style={styles.guidanceTiming}>{text}</Text>
        ))}
      </View>
    </View>
  );
}

function PlainGuidanceBullet({
  text, prominent = false,
}: { text: string; prominent?: boolean }) {
  return (
    <View style={styles.guidanceBullet}>
      <Text style={styles.guidanceBulletMarker}>-</Text>
      <Text style={prominent
        ? styles.guidanceTakeawayBulletText
        : [styles.guidanceBulletText, styles.guidanceTextFlex]}>{text}</Text>
    </View>
  );
}

function ContextNote({ item }: { item: UvScoutInsightItem }) {
  return (
    <Text style={styles.guidanceContextText}>
      <Text style={styles.guidanceContextTitle}>{item.title}: </Text>
      {item.text}
    </Text>
  );
}

export function OutingForecast({ latitude, longitude, onTimezoneChange, plan }: Props) {
  const { forecast, error, loading, retry } = useHourlyForecast(
    latitude,
    longitude,
    'Could not load the forecast for this outing.',
  );

  useEffect(() => {
    if (forecast) onTimezoneChange(forecast.timezone);
  }, [forecast, onTimezoneChange]);

  const summary = forecast ? summarizeOutingForecast(forecast, plan.start, plan.end) : null;
  const guidance = summary ? getUvScoutInsight(summary, forecast?.timezone ?? 'UTC') : null;
  const forecastLimitMessage = forecast ? getForecastLimitMessage(forecast, plan.end) : null;

  return (
    <View style={styles.section}>
      <Text style={styles.timeRange}>
        {forecast
          ? formatDateTimeRange(plan.start.getTime() / 1000, plan.end.getTime() / 1000, forecast.timezone)
          : 'Loading selected hours'}
      </Text>
      {loading && <ActivityIndicator color="#151515" style={styles.loading} />}
      {error && <ForecastError message={error} onRetry={retry} />}
      {forecast && !summary && !loading && (
        <Text style={styles.message}>
          {forecastLimitMessage ?? 'The forecast does not cover these outing hours. Adjust the start time or duration and try again.'}
        </Text>
      )}
      {forecast && summary && (
        <>
          <OutingUvTimeline hours={summary.hours} timezone={forecast.timezone} />
          {guidance && (
            <View style={styles.guidance}>
              <Text style={styles.guidanceTitle}>UV guidance</Text>
              {guidance.coverageMessage && (
                <Text style={styles.guidanceCoverage}>{guidance.coverageMessage}</Text>
              )}
              <View style={styles.guidanceTakeawayList}>
                {guidance.takeawayBullets.map((text, index) => (
                  <PlainGuidanceBullet key={`takeaway-${index}`} text={text} prominent />
                ))}
              </View>
              <View style={styles.guidanceDetails}>
                <Text style={styles.guidanceGroupHeading}>UV breakdown</Text>
                <View style={styles.insightList}>
                  {guidance.breakdown.map((text, index) => (
                    <PlainGuidanceBullet key={`detail-${index}`} text={text} />
                  ))}
                </View>
              </View>
              <View style={styles.guidanceActions}>
                <Text style={styles.guidanceGroupHeading}>Protection steps</Text>
                <View style={styles.guidanceActionList}>
                  {guidance.practicalGuidance.map((item, index) => (
                    <GuidanceBullet key={`action-${index}`} item={item} />
                  ))}
                </View>
                {guidance.contextNotes.length > 0 && (
                  <View style={styles.guidanceContext}>
                    <Text style={styles.guidanceContextHeading}>Also consider</Text>
                    {guidance.contextNotes.map((item, index) => (
                      <ContextNote key={`context-${index}`} item={item} />
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={styles.summaryGrid}>
            <View style={styles.summaryRow}>
              <SummaryMetric
                title="UV INDEX"
                mainValue={summary.highestUv.toFixed(1)}
                description={`Rounded category: ${summary.highestCategory.label}`}
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
                mainValue={summary.averageCloudCover === null ? '-' : `${Math.round(summary.averageCloudCover)}%`}
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
          {guidance?.categoryNote && (
            <Text style={styles.guidanceCategoryNote}>{guidance.categoryNote}</Text>
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
  section: { borderTopColor: '#EEEEEE', borderTopWidth: 1, marginTop: 28, paddingTop: 20 },
  timeRange: { color: '#555555', fontSize: 14, fontWeight: '500', textAlign: 'center' },
  loading: { alignSelf: 'center', marginTop: 20 },
  message: { color: '#A6A6A6', fontSize: 14, lineHeight: 20, marginTop: 16, textAlign: 'center' },
  summaryGrid: { marginTop: 20 },
  summaryRow: { alignItems: 'stretch', flexDirection: 'row' },
  summaryItem: { alignItems: 'center', flex: 1, justifyContent: 'flex-start', paddingHorizontal: 4, paddingVertical: 7 },
  summaryDivider: { alignSelf: 'stretch', backgroundColor: '#DDDDDD', marginHorizontal: 7, marginVertical: 5, width: 1 },
  summaryHorizontalDivider: { backgroundColor: '#E5E5E5', height: 1 },
  summaryLabel: { color: '#696969', fontSize: 10, letterSpacing: 0.5, minHeight: 24, textAlign: 'center', textTransform: 'uppercase' },
  summaryValue: { color: '#151515', fontSize: 18, marginTop: 4, textAlign: 'center' },
  summaryDetail: { color: '#696969', fontSize: 12, marginTop: 2, textAlign: 'center' },
  summarySecondary: { color: '#696969', fontSize: 13, marginTop: 4, textAlign: 'center' },
  guidance: { marginTop: 20 },
  guidanceTitle: { color: '#151515', fontSize: 14, fontWeight: '600', lineHeight: 19, textAlign: 'center' },
  guidanceGroupHeading: { color: '#151515', fontSize: 14, fontWeight: '600', lineHeight: 19, marginTop: 14, textAlign: 'center' },
  guidanceCoverage: { color: '#666666', fontSize: 13, lineHeight: 19, marginTop: 10 },
  guidanceTakeawayList: { marginTop: 10 },
  guidanceCategoryNote: { color: '#777777', fontSize: 12, lineHeight: 17, marginTop: 8, textAlign: 'center' },
  guidanceTakeawayBulletText: { color: '#333333', flex: 1, fontSize: 13, lineHeight: 19 },
  guidanceDetails: { marginTop: 12 },
  guidanceActions: { borderTopColor: '#E6E6E6', borderTopWidth: 1, marginTop: 18, paddingTop: 2 },
  guidanceActionList: { marginTop: 7, rowGap: 5 },
  guidanceContext: { marginTop: 13, paddingLeft: 18 },
  guidanceContextHeading: { color: '#666666', fontSize: 13, lineHeight: 19 },
  guidanceContextText: { color: '#666666', fontSize: 13, lineHeight: 19, marginTop: 5 },
  guidanceContextTitle: { color: '#555555', fontWeight: '500' },
  insightList: { marginTop: 6 },
  guidanceBullet: { alignItems: 'flex-start', flexDirection: 'row', marginTop: 5 },
  guidanceBulletContent: { flex: 1 },
  guidanceTiming: { color: '#666666', fontSize: 13, lineHeight: 19, marginTop: 4 },
  guidanceBulletMarker: { color: '#555555', fontSize: 13, lineHeight: 19, marginRight: 8, width: 10 },
  guidanceBulletText: { color: '#333333', fontSize: 13, lineHeight: 19 },
  guidanceTextFlex: { flex: 1 },
  guidanceBulletTitle: { color: '#333333', fontWeight: '600' },
  subheading: { color: '#151515', fontSize: 17, fontWeight: '600', marginTop: 28, textAlign: 'center' },
  source: { color: '#767676', fontSize: 11, marginTop: 14, textAlign: 'center' },
});
