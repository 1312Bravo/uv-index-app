export type ForecastHour = {
  time: number;
  uv: number;
  temperature: number;
  period: 'past' | 'now' | 'future';
};

export type HourlyForecast = {
  timezone: string;
  hours: ForecastHour[];
};
