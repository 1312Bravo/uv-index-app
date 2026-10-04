export type ForecastHour = {
  time: number;
  uv: number;
  temperature: number;
  cloudCover: number | null;
  period: 'past' | 'now' | 'future';
};

export type HourlyForecast = {
  timezone: string;
  hours: ForecastHour[];
};
