export type ShadeLevel =
  | 'open-sun'
  | 'mostly-sun'
  | 'mixed-sun-and-shade'
  | 'overhead-cover';

export const SHADE_OPTIONS: ReadonlyArray<{ value: ShadeLevel; label: string }> = [
  { value: 'open-sun', label: 'Open sun throughout' },
  { value: 'mostly-sun', label: 'Mostly sun with short shaded sections' },
  { value: 'mixed-sun-and-shade', label: 'About half sun and half shade' },
  { value: 'overhead-cover', label: 'Overhead cover for most of the outing' },
];

export function getShadeLabel(value: ShadeLevel): string {
  return SHADE_OPTIONS.find((option) => option.value === value)?.label ?? 'Choose shade';
}
