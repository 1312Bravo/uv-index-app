import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { SelectedLocation } from '../../domain/location/locationTypes';
import { formatLocationCoordinates, getLocationName } from './formatLocation';

type Props = {
  location: SelectedLocation | null;
  timeZone: string | null;
  timeZoneUnavailable: boolean;
};

export function LocationSummary({ location, timeZone, timeZoneUnavailable }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const localDateTime = location && !timeZone
    ? null
    : new Intl.DateTimeFormat('en', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      ...(timeZone ? { timeZone } : {}),
    }).format(new Date(now));

  return (
    <View style={styles.container}>
      <Text style={localDateTime ? styles.dateTime : styles.timeStatus}>
        {localDateTime ?? (timeZoneUnavailable ? 'Local time unavailable' : 'Finding local time...')}
      </Text>
      {location && (
        <>
          <View style={styles.divider} />
          <Text style={styles.name}>{getLocationName(location)}</Text>
          <Text style={styles.coordinates}>{formatLocationCoordinates(location)}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomColor: '#EEEEEE',
    borderBottomWidth: 1,
    marginTop: 24,
    paddingBottom: 12,
  },
  name: {
    color: '#151515',
    fontSize: 15,
    textAlign: 'center',
  },
  coordinates: {
    color: '#777777',
    fontSize: 12,
    marginTop: 3,
    textAlign: 'center',
  },
  dateTime: {
    color: '#151515',
    fontSize: 15,
    textAlign: 'center',
  },
  timeStatus: {
    color: '#777777',
    fontSize: 12,
    textAlign: 'center',
  },
  divider: {
    backgroundColor: '#E5E5E5',
    height: 1,
    marginBottom: 8,
    marginTop: 9,
    width: 64,
  },
});
