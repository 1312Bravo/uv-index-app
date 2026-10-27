export type HourlyChartLayout = {
  binWidth: number;
  barWidth: number;
  maxBarHeight: number;
  valueGroupHeight: number;
};

export const PHONE_CHART_LAYOUT: HourlyChartLayout = {
  binWidth: 42,
  barWidth: 16,
  maxBarHeight: 58,
  valueGroupHeight: 40,
};

export const DESKTOP_CHART_LAYOUT: HourlyChartLayout = {
  binWidth: 76,
  barWidth: 30,
  maxBarHeight: 86,
  valueGroupHeight: 50,
};

export type SelectedRange = { start: number; end: number };
