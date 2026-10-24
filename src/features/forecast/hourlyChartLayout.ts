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
  binWidth: 64,
  barWidth: 24,
  maxBarHeight: 76,
  valueGroupHeight: 46,
};

export type SelectedRange = { start: number; end: number };
