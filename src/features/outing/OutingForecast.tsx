import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { getUvScoutInsight, type UvScoutInsightItem } from '../../domain/guidance/getUvScoutInsight';
import { HourlyUvBarChart } from '../forecast/HourlyUvBarChart';
import { ForecastError } from '../forecast/ForecastError';
import { useHourlyForecast } from '../forecast/useHourlyForecast';
import { summarizeOutingForecast } from '../../domain/outing/calculateOutingForecast';
import type { TimePlan } from '../../domain/outing/timePlan';
import type { HourlyForecast } from '../../domain/forecast/forecastTypes';
import { SourceAttribution } from '../../ui/SourceAttribution';
import { uiColors, uiType } from '../../ui/visualStyle';
import { OutingUvTimeline } from './OutingUvTimeline';
import { OutingUvSummary, OutingWeatherSummary } from './OutingForecastMetrics';

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

  const forecastEnd = lastHour.time;
  if (outingEnd.getTime() / 1000 <= forecastEnd) return null;

  return `The forecast is available through ${formatDate(forecastEnd, forecast.timezone)} at ${formatTime(forecastEnd, forecast.timezone)}. Adjust the outing time or duration to see its full forecast.`;
}

function GuidanceBullet({ item, centeredBlock = false }: {
  item: UvScoutInsightItem;
  centeredBlock?: boolean;
}) {
  if (centeredBlock) {
    return (
      <View style={styles.webBulletRow}>
        <Text style={styles.guidanceBulletMarker}>-</Text>
        <View style={styles.guidanceBulletContent}>
          <Text style={[styles.guidanceBulletText, styles.webBulletCopy]}>
            <Text style={styles.guidanceBulletTitle}>{item.title}{item.text ? ': ' : ''}</Text>
            {item.text}
          </Text>
          {item.subItems?.map((text, index) => (
            <Text key={`sub-${index}`} style={[styles.guidanceTiming, styles.webBulletCopy]}>
              {text}
            </Text>
          ))}
        </View>
      </View>
    );
  }

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
  text, prominent = false, centeredBlock = false,
}: { text: string; prominent?: boolean; centeredBlock?: boolean }) {
  if (centeredBlock) {
    return (
      <View style={styles.webBulletRow}>
        <Text style={styles.guidanceBulletMarker}>-</Text>
        <Text style={[
          prominent ? styles.guidanceTakeawayBulletText : styles.guidanceBulletText,
          styles.guidanceTextFlex,
          styles.webBulletCopy,
        ]}>
          {text}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.guidanceBullet}>
      <Text style={styles.guidanceBulletMarker}>-</Text>
      <Text style={prominent
        ? styles.guidanceTakeawayBulletText
        : [styles.guidanceBulletText, styles.guidanceTextFlex]}>{text}</Text>
    </View>
  );
}

function ContextNote({ item, centeredBlock = false }: {
  item: UvScoutInsightItem;
  centeredBlock?: boolean;
}) {
  return (
    <Text style={[styles.guidanceContextText, centeredBlock && styles.webBulletCopy]}>
      <Text style={styles.guidanceContextTitle}>{item.title}: </Text>
      {item.text}
    </Text>
  );
}

export function OutingForecast({ latitude, longitude, onTimezoneChange, plan }: Props) {
  const { width } = useWindowDimensions();
  const isWideWeb = Platform.OS === 'web' && width >= 760;
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const refreshSlot = Math.floor(currentTime / (15 * 60_000));
  const { forecast, error, loading, retry } = useHourlyForecast(
    latitude,
    longitude,
    'Could not load the forecast for this outing.',
    refreshSlot,
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

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
      {loading && <ActivityIndicator color={uiColors.accent} style={styles.loading} />}
      {error && <ForecastError message={error} onRetry={retry} />}
      {forecast && !summary && !loading && (
        <Text style={styles.message}>
          {forecastLimitMessage ?? 'The forecast does not cover these outing hours. Adjust the start time or duration and try again.'}
        </Text>
      )}
      {forecast && summary && (
        <>
          <Text style={styles.sectionLabel}><Text style={styles.uvAccent}>UV</Text> summary</Text>
          <OutingUvSummary summary={summary} />
          <View style={styles.uvSummaryDivider} />
          <OutingUvTimeline
            hours={summary.hours}
            timezone={forecast.timezone}
          />
          {guidance && <View style={styles.guidanceDivider} />}
          {guidance && (
            <View style={[styles.guidance, isWideWeb && styles.webGuidance]}>
              <Text style={styles.guidanceTitle}><Text style={styles.uvAccent}>UV</Text> guidance</Text>
              {guidance.coverageMessage && (
                <Text style={[styles.guidanceCoverage, isWideWeb && styles.webCenteredText]}>
                  {guidance.coverageMessage}
                </Text>
              )}
              <View style={isWideWeb && styles.webSharedBulletColumn}>
                <View style={styles.guidanceTakeawayList}>
                  {guidance.takeawayBullets.map((text, index) => (
                    <PlainGuidanceBullet
                      key={`takeaway-${index}`}
                      centeredBlock={isWideWeb}
                      text={text}
                      prominent
                    />
                  ))}
                </View>
                <View style={styles.guidanceDetails}>
                  <Text style={styles.guidanceGroupHeading}><Text style={styles.uvAccent}>UV</Text> breakdown</Text>
                  <View style={styles.insightList}>
                    {guidance.breakdown.map((text, index) => (
                      <PlainGuidanceBullet
                        key={`detail-${index}`}
                        centeredBlock={isWideWeb}
                        text={text}
                      />
                    ))}
                  </View>
                </View>
                <View style={styles.guidanceActions}>
                  <Text style={styles.guidanceGroupHeading}>Protection steps</Text>
                  <View style={styles.guidanceActionList}>
                    {guidance.practicalGuidance.map((item, index) => (
                      <GuidanceBullet key={`action-${index}`} centeredBlock={isWideWeb} item={item} />
                    ))}
                  </View>
                  {guidance.contextNotes.length > 0 && (
                    <View style={[styles.guidanceContext, isWideWeb && styles.webSharedContext]}>
                      <Text style={[
                        styles.guidanceContextHeading,
                        isWideWeb && styles.webCenteredText,
                      ]}>
                        Also consider
                      </Text>
                      {guidance.contextNotes.map((item, index) => (
                        <ContextNote key={`context-${index}`} centeredBlock={isWideWeb} item={item} />
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          <OutingWeatherSummary summary={summary} />

          <View style={styles.hourlyChartDivider} />
          <Text style={styles.subheading}><Text style={styles.uvAccent}>UV</Text> &amp; weather by hour</Text>
          <HourlyUvBarChart
            hours={forecast.hours}
            timezone={forecast.timezone}
            daylight={forecast.daylight}
            sunTime={plan.start.getTime() / 1000}
            selectedRange={{
              start: plan.start.getTime() / 1000,
              end: plan.end.getTime() / 1000,
            }}
            uvSelectedRange={{
              start: plan.start.getTime() / 1000,
              end: plan.end.getTime() / 1000,
            }}
            useHourlyForecast
          />
          <SourceAttribution label="Forecast data by Open-Meteo" url="https://open-meteo.com/" />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderTopColor: uiColors.line, borderTopWidth: 1, marginTop: 28, paddingTop: 20 },
  timeRange: { color: uiColors.secondary, fontSize: 14, fontWeight: '500', textAlign: 'center' },
  loading: { alignSelf: 'center', marginTop: 20 },
  message: { color: uiColors.faint, fontSize: 14, lineHeight: 20, marginTop: 16, textAlign: 'center' },
  uvSummaryDivider: { alignSelf: 'center', backgroundColor: uiColors.line, height: 1, marginBottom: 10, width: 96 },
  guidanceDivider: { alignSelf: 'stretch', backgroundColor: uiColors.line, height: 1, marginTop: 20 },
  guidance: { marginTop: 12 },
  webGuidance: { alignSelf: 'center', maxWidth: 700, width: '100%' },
  webBulletCopy: { textAlign: 'left' },
  // One intrinsic-width column aligns all guidance sections to the widest bullet.
  webSharedBulletColumn: { alignSelf: 'center', maxWidth: '100%', width: 'max-content' as any },
  webSharedContext: { paddingLeft: 0 },
  webBulletRow: { alignSelf: 'stretch', flexDirection: 'row', marginTop: 5 },
  webCenteredText: { alignSelf: 'center', textAlign: 'center' },
  sectionLabel: { color: uiColors.ink, fontSize: 14, fontWeight: '600', lineHeight: 19, marginTop: 20, textAlign: 'center' },
  uvAccent: { color: uiColors.accent },
  guidanceTitle: { color: uiColors.ink, fontSize: 14, fontWeight: '600', lineHeight: 19, textAlign: 'center' },
  guidanceGroupHeading: { color: uiColors.ink, fontSize: 14, fontWeight: '600', lineHeight: 19, marginTop: 14, textAlign: 'center' },
  guidanceCoverage: { color: uiColors.secondary, fontSize: 13, lineHeight: 19, marginTop: 10 },
  guidanceTakeawayList: { marginTop: 10 },
  guidanceTakeawayBulletText: { color: uiColors.body, flex: 1, fontSize: 13, lineHeight: 19 },
  guidanceDetails: { marginTop: 12 },
  guidanceActions: { marginTop: 18 },
  guidanceActionList: { marginTop: 7, rowGap: 5 },
  guidanceContext: { marginTop: 13, paddingLeft: 18 },
  guidanceContextHeading: { color: uiColors.secondary, fontSize: 13, lineHeight: 19 },
  guidanceContextText: { color: uiColors.secondary, fontSize: 13, lineHeight: 19, marginTop: 5 },
  guidanceContextTitle: { color: uiColors.body, fontWeight: '500' },
  insightList: { marginTop: 6 },
  guidanceBullet: { alignItems: 'flex-start', flexDirection: 'row', marginTop: 5 },
  guidanceBulletContent: { flex: 1 },
  guidanceTiming: { color: uiColors.secondary, fontSize: 13, lineHeight: 19, marginTop: 4 },
  guidanceBulletMarker: { color: uiColors.secondary, fontSize: 13, lineHeight: 19, marginRight: 8, width: 10 },
  guidanceBulletText: { color: uiColors.body, fontSize: 13, lineHeight: 19 },
  guidanceTextFlex: { flex: 1 },
  guidanceBulletTitle: { color: uiColors.body, fontWeight: '600' },
  hourlyChartDivider: { alignSelf: 'stretch', backgroundColor: uiColors.line, height: 1, marginTop: 20 },
  subheading: { color: uiColors.ink, fontSize: uiType.sectionHeading, fontWeight: '600', marginTop: 12, textAlign: 'center' },
});
