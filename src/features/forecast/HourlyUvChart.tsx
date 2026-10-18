import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { getUvForecastAtTime } from '../../domain/forecast/getUvForecastAtTime';
import { getHourlyUvGuidance } from '../../domain/guidance/getHourlyUvGuidance';
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

function formatCurrentDateTime(time: number, timezone: string): string {
  return new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  }).format(new Date(time));
}

export function HourlyUvChart({ latitude, longitude, onTimezoneChange }: Props) {
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [timeMode, setTimeMode] = useState<OutlookTimeMode>('now');
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [scrollTarget, setScrollTarget] = useState<{ time: number } | undefined>();
  const refreshSlot = Math.floor(currentTime / (15 * 60_000));
  const { forecast, error, loading } = useHourlyForecast(
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
      {loading && <ActivityIndicator color="#151515" style={styles.loading} />}
      {error && <Text style={styles.message}>{error}</Text>}
      {forecast && (
        <>
          {selectedHour && (
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
          )}
          {hourlyGuidance && selectedHour && (
            <HourlyUvGuidance
              guidance={hourlyGuidance}
              estimateTime={forecast.currentConditionsTime}
              forecastHourTime={timeMode === 'now' ? selectedHour.time : selectedCustomTime ?? selectedHour.time}
              isCurrent={timeMode === 'now'}
              isInterpolated={customUvForecast?.interpolated ?? false}
              timezone={forecast.timezone}
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
          <Text style={styles.currentTime}>{formatCurrentDateTime(currentTime, forecast.timezone)}</Text>
          <Text style={styles.source}>Open-Meteo forecast data</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  heading: { color: '#151515', fontSize: 18, fontWeight: '600', marginTop: 24, textAlign: 'center' },
  loading: { alignSelf: 'center', marginTop: 20 },
  message: { color: '#9C3D32', fontSize: 14, lineHeight: 20, marginTop: 16, textAlign: 'center' },
  currentTime: { color: '#444444', fontSize: 13, fontWeight: '500', marginTop: 14, textAlign: 'center' },
  source: { color: '#767676', fontSize: 11, marginTop: 10, textAlign: 'center' },
});
