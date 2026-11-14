export type CurrentAirQuality = {
  /** Unrounded European AQI scale points returned by Open-Meteo. */
  europeanAqi: number;
  /** Provider estimate time as Unix seconds. */
  time: number;
  /** IANA time zone returned for the selected coordinates. */
  timezone: string;
};

export type HourlyAirQualityValue = {
  /** Start timestamp for this hourly AQI sample, as Unix seconds. */
  time: number;
  /** Missing hourly forecast values remain null so coverage is explicit. */
  europeanAqi: number | null;
};
