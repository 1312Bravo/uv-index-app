export type UvCategory = 'low' | 'moderate' | 'high' | 'very-high' | 'extreme';

export type UvCategoryInfo = {
  key: UvCategory;
  label: string;
};

export function getUvCategory(uv: number): UvCategoryInfo {
  if (uv < 3) return { key: 'low', label: 'Low' };
  if (uv < 6) return { key: 'moderate', label: 'Moderate' };
  if (uv < 8) return { key: 'high', label: 'High' };
  if (uv < 11) return { key: 'very-high', label: 'Very high' };
  return { key: 'extreme', label: 'Extreme' };
}
