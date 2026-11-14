import descriptions from './outingAirQualityDescriptions.json';
import { getEuropeanAqiCategory, type EuropeanAqiCategory } from './getEuropeanAqiCategory';
import type { OutingAirQualitySummary } from './summarizeOutingAirQuality';

const requiredFields = {
  sameCategory: ['{low}', '{high}', '{average}', '{category}'],
  higherPeakCategory: ['{low}', '{high}', '{average}', '{peakCategory}'],
  singleRoundedValue: ['{value}', '{average}', '{category}'],
  singleRoundedValueHigherPeak: ['{value}', '{average}', '{peakCategory}'],
  differentAdvice: ['{peakAdvice}'],
} as const;

for (const [key, fields] of Object.entries(requiredFields)) {
  const template = descriptions[key as keyof typeof descriptions];
  if (typeof template !== 'string' || !template.trim() || fields.some((field) => !template.includes(field))) {
    throw new Error(`Invalid outing air-quality description: ${key}.`);
  }
}

function lowercaseFirst(text: string): string {
  return text[0].toLowerCase() + text.slice(1);
}

function getAudienceAdvice(averageAdvice: string, peakAdvice: string): string {
  return averageAdvice === peakAdvice
    ? peakAdvice
    : descriptions.differentAdvice.replace('{peakAdvice}', lowercaseFirst(peakAdvice));
}

export function getOutingAirQualityDescription(
  summary: OutingAirQualitySummary,
  averageCategory: EuropeanAqiCategory,
  peakCategory: EuropeanAqiCategory,
): { takeaway: string; generalAdvice: string; sensitiveAdvice: string } {
  const lowestCategory = getEuropeanAqiCategory(summary.lowestAqi);
  const low = Math.round(summary.lowestAqi).toString();
  const high = Math.round(summary.peakAqi).toString();
  const average = summary.averageAqi.toFixed(1);
  const sameCategoryThroughout = lowestCategory.key === peakCategory.key;
  const template = low === high
    ? (sameCategoryThroughout ? descriptions.singleRoundedValue : descriptions.singleRoundedValueHigherPeak)
    : (sameCategoryThroughout ? descriptions.sameCategory : descriptions.higherPeakCategory);
  const takeaway = template
    .replace('{low}', low)
    .replace('{high}', high)
    .replace('{value}', low)
    .replace('{average}', average)
    .replace('{category}', peakCategory.label)
    .replace('{peakCategory}', peakCategory.label);

  return {
    takeaway,
    generalAdvice: getAudienceAdvice(averageCategory.generalAdvice, peakCategory.generalAdvice),
    sensitiveAdvice: getAudienceAdvice(averageCategory.sensitiveAdvice, peakCategory.sensitiveAdvice),
  };
}
