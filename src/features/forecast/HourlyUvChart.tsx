import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { getUvForecastAtTime } from '../../domain/forecast/getUvForecastAtTime';
import { getHourlyUvGuidance } from '../../domain/guidance/getHourlyUvGuidance';
import { SourceAttribution } from '../../ui/SourceAttribution';
import { uiColors, uiType } from '../../ui/visualStyle';
import { ForecastError } from './ForecastError';
import { HourlyUvGuidance } from './HourlyUvGuidance';
import { OutlookTimeSelector } from './OutlookTimeSelector';
import { getForecastHourForTime, getOutlookTimeSlots } from './getOutlookTimeSlots';
import { useHourlyForecast } from './useHourlyForecast';
import { HourlyUvBarChart } from './HourlyUvBarChart';

type Props = {
  latitude: number;
  longitude: number;
  onTimezoneChange: (timeZone: string) => void;
};

const INITIAL_SCROLL_HOURS = 2;
type OutlookTimeMode = 'now' | 'custom';

export function HourlyUvChart({ latitude, longitude, onTimezoneChange }: Props) {
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [timeMode, setTimeMode] = useState<OutlookTimeMode>('now');
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [scrollTarget, setScrollTarget] = useState<{ time: number } | undefined>();
  const refreshSlot = Math.floor(currentTime / (15 * 60_000));
  const { forecast, error, loading, retry } = useHourlyForecast(
    latitude,
    longitude,
    'Could not load the UV forecast. Try another location or try again later.',
    refreshSlot,
  );
  const currentHour = forecast?.hours.find((hour) => hour.period === 'now');
  const customTimeSlots = useMemo(
    () => forecast ? getOutlookTimeSlots(forecast.hours, forecast.timezone, currentTime) : [],
    [currentTime, forecast],
  );
  const selectedCustomTime = timeMode === 'custom'
    ? customTimeSlots.find((slot) => slot.time === selectedTime)?.time ?? customTimeSlots[0]?.time ?? null
    : null;
  const selectedHour = timeMode === 'now'
    ? currentHour
    : selectedCustomTime !== null && forecast
      ? getForecastHourForTime(forecast.hours, selectedCustomTime)
      : null;
  const customUvForecast = timeMode === 'custom' && selectedCustomTime !== null && forecast
    ? getUvForecastAtTime(forecast.hours, selectedCustomTime)
    : null;
  const guidanceUv = timeMode === 'now' ? selectedHour?.uv : customUvForecast?.uv;
  const hourlyGuidance = selectedHour && guidanceUv !== undefined
    ? getHourlyUvGuidance(
      guidanceUv,
      timeMode === 'now' ? selectedHour.cloudCover : selectedHour.hourlyCloudCover ?? selectedHour.cloudCover,
    )
    : null;
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (forecast) onTimezoneChange(forecast.timezone);
  }, [forecast, onTimezoneChange]);

  return (
    <View style={styles.section}>
      {loading && <ActivityIndicator color={uiColors.accent} style={styles.loading} />}
      {error && <ForecastError message={error} onRetry={retry} />}
      {forecast && (
        <>
          {selectedHour && (
            <>
              <OutlookTimeSelector
                mode={timeMode}
                hours={forecast.hours}
                nowTime={currentTime}
                onSelectMode={(mode) => {
                  setTimeMode(mode);
                  if (mode === 'now') setScrollTarget(undefined);
                  const selectedTimeIsAvailable = customTimeSlots.some((slot) =>
                    slot.time === selectedTime,
                  );
                  if (mode === 'custom' && !selectedTimeIsAvailable) {
                    const firstFutureSlot = customTimeSlots[0];
                    if (firstFutureSlot) setSelectedTime(firstFutureSlot.time);
                  }
                }}
                onSelectHour={(time) => {
                  setSelectedTime(time);
                  const selectedForecastHour = getForecastHourForTime(forecast.hours, time);
                  setScrollTarget(selectedForecastHour ? { time: selectedForecastHour.time } : undefined);
                }}
                selectedTime={selectedCustomTime}
                timezone={forecast.timezone}
              />
              <View style={[styles.selectorDivider, timeMode === 'now' && styles.nowSelectorDivider]} />
            </>
          )}
          {hourlyGuidance && selectedHour && (
            <HourlyUvGuidance
              guidance={hourlyGuidance}
              estimateTime={forecast.currentConditionsTime}
              forecastHourTime={timeMode === 'now' ? selectedHour.time : selectedCustomTime ?? selectedHour.time}
              isCurrent={timeMode === 'now'}
              isInterpolated={customUvForecast?.interpolated ?? false}
              timezone={forecast.timezone}
              currentWeather={timeMode === 'now' ? {
                temperature: selectedHour.temperature,
                cloudCover: selectedHour.cloudCover,
                precipitation: forecast.currentPrecipitation,
                precipitationInterval: forecast.currentPrecipitationInterval,
                precipitationTime: forecast.currentPrecipitationTime,
                timezone: forecast.timezone,
              } : undefined}
            />
          )}
          {!hourlyGuidance && <Text style={styles.message}>UV estimate unavailable.</Text>}
          <Text style={styles.heading}>UV &amp; weather by hour</Text>
          <HourlyUvBarChart
            hours={forecast.hours}
            timezone={forecast.timezone}
            daylight={forecast.daylight}
            sunTime={timeMode === 'now'
              ? currentTime / 1000
              : selectedCustomTime ?? (selectedHour?.time ?? currentTime / 1000) + 1800}
            initialScrollHours={INITIAL_SCROLL_HOURS}
            showFullOutlook
            useHourlyForecast={timeMode === 'custom'}
            selectedHourTime={selectedHour?.time}
            scrollTarget={scrollTarget}
          />
          <SourceAttribution label="Forecast data by Open-Meteo" url="https://open-meteo.com/" />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  selectorDivider: {
    alignSelf: 'center',
    backgroundColor: uiColors.line,
    height: 1,
    marginBottom: 16,
    marginTop: 16,
    width: '84%',
  },
  nowSelectorDivider: { marginTop: 15 },
  heading: { color: uiColors.ink, fontSize: uiType.sectionHeading, fontWeight: '600', marginTop: 26, textAlign: 'center' },
  loading: { alignSelf: 'center', marginTop: 20 },
  message: { color: uiColors.faint, fontSize: 14, lineHeight: 20, marginTop: 16, textAlign: 'center' },
});
