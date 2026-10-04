import type { ShadeLevel } from './shadeOptions';

export type TimePlan = {
  start: Date;
  end: Date;
  durationMinutes: number;
  shade: ShadeLevel;
};
