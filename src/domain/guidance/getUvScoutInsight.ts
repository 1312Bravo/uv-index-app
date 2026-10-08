import definitions from './uvScoutInsight.json';
import rules from './uvScoutRecommendationRules.json';
import { getHourOverlap, type OutingForecastSummary } from '../outing/calculateOutingForecast';

type UvBandKey = 'below-3' | '3-to-8' | '8-plus';
type ThresholdKey = 'protection' | 'extra-protection';

export type UvScoutInsight = {
  note: string;
  headline: string;
  explanation: string;
  profileDetails: string[];
  practicalGuidance: string[];
  coverageMessage: string | null;
  reapplicationReminder: string | null;
};

const expectedBandKeys: UvBandKey[] = ['below-3', '3-to-8', '8-plus'];

function validateDefinitions() {
  const usedBandKeys = new Set<string>();

  if (!definitions.note.trim()) throw new Error('UV Scout insight note must not be empty.');

  if (rules.schemaVersion !== 1 || !rules.modelNote.trim()) {
    throw new Error('UV Scout recommendation rules have an unsupported schema or empty model note.');
  }

  for (const [index, band] of rules.uvBands.entries()) {
    const previousBand = rules.uvBands[index - 1];
    if (
      !expectedBandKeys.includes(band.key as UvBandKey) || usedBandKeys.has(band.key) ||
      !band.label.trim() || !Number.isFinite(band.minimumUvInclusive) ||
      (index === 0
        ? band.minimumUvInclusive !== 0
        : band.minimumUvInclusive !== previousBand.maximumUvExclusive) ||
      (band.maximumUvExclusive !== null &&
        (!Number.isFinite(band.maximumUvExclusive) || band.maximumUvExclusive <= band.minimumUvInclusive)) ||
      (index === rules.uvBands.length - 1 && band.maximumUvExclusive !== null) ||
      (index < rules.uvBands.length - 1 && band.maximumUvExclusive === null)
    ) {
      throw new Error(`Invalid or duplicate UV Scout exposure band: ${band.key}.`);
    }
    usedBandKeys.add(band.key);
  }
  if (expectedBandKeys.some((key) => !usedBandKeys.has(key))) {
    throw new Error('All three UV Scout exposure bands must be defined.');
  }

  if (rules.uvBands[0].maximumUvExclusive !== 3 ||
    rules.uvBands[1].minimumUvInclusive !== 3 ||
    rules.uvBands[1].maximumUvExclusive !== 8 ||
    rules.uvBands[2].minimumUvInclusive !== 8) {
    throw new Error('UV Scout exposure bands must use raw UVI thresholds 3 and 8.');
  }
  if (
    rules.guidanceTriggers.elevatedBandKey !== '3-to-8' ||
    rules.guidanceTriggers.extraAttentionBandKey !== '8-plus' ||
    rules.sunscreenReminder.minimumCoveredUvInclusive !== rules.uvBands[1].minimumUvInclusive ||
    !(rules.sunscreenReminder.messageKey in definitions.messages) ||
    !(rules.forecastCoverage.messageKey in definitions.messages)
  ) {
    throw new Error('UV Scout trigger bands or message references do not match the editable definitions.');
  }
  const conditionalRuleKeys = new Set<string>();
  if (rules.conditionalContextRules.length === 0 || rules.conditionalContextRules.some((rule) => {
    const invalid = !rule.key.trim() || conditionalRuleKeys.has(rule.key) ||
      !Number.isFinite(rule.whenAnyCoveredUvAtOrAbove) ||
      rule.whenAnyCoveredUvAtOrAbove !== rules.uvBands[1].minimumUvInclusive ||
      !(rule.messageKey in definitions.profileMessages);
    conditionalRuleKeys.add(rule.key);
    return invalid;
  })) {
    throw new Error('UV Scout conditional context rules are invalid or duplicated.');
  }

  const profileMessages = Object.values(definitions.profileMessages);
  if (profileMessages.some((message) => typeof message !== 'string' || !message.trim())) {
    throw new Error('UV Scout profile messages must be non-empty strings.');
  }
  if (
    !definitions.messages.coverageIncomplete.trim() ||
    !definitions.messages.bandDuration.trim() ||
    !definitions.messages.reapplication.trim() ||
    !Number.isFinite(rules.sunscreenReminder.minimumPlannedOutingMinutes) ||
    rules.sunscreenReminder.minimumPlannedOutingMinutes <= 0 ||
    !Number.isFinite(rules.sunscreenReminder.minimumCoveredUvInclusive) ||
    rules.sunscreenReminder.minimumCoveredUvInclusive < 0 ||
    !Number.isFinite(rules.guidanceTriggers.coverageToleranceSeconds) ||
    rules.guidanceTriggers.coverageToleranceSeconds < 0 ||
    !rules.profileSignals.includePeakAndTime ||
    !rules.profileSignals.includeDurationWeightedAverage ||
    !rules.profileSignals.includeTimeInEachNonzeroBand ||
    rules.profileSignals.includeLongestContinuousAtOrAboveUv.length !== 2 ||
    rules.profileSignals.includeLongestContinuousAtOrAboveUv[0] !== 3 ||
    rules.profileSignals.includeLongestContinuousAtOrAboveUv[1] !== 8 ||
    rules.profileSignals.forecastHourlyPointRepresentsSeconds !== 3600 ||
    !rules.profileSignals.missingCoverageBreaksContinuity ||
    !rules.forecastCoverage.neverFillMissingWithZero ||
    !rules.forecastCoverage.labelProfileAsCoveredForecast ||
    rules.factorPolicy.length === 0 ||
    new Set(rules.factorPolicy.map((factor) => factor.key)).size !== rules.factorPolicy.length ||
    rules.factorPolicy.some((factor) =>
      !factor.key.trim() || !factor.handling.trim() ||
      !['primary-profile-input', 'profile-window', 'confidence-limitation', 'display-context-only',
        'timing-context-only', 'not-known-by-default'].includes(factor.role),
    ) ||
    rules.evidenceAndProductBoundary.sourceBackedConcepts.length === 0 ||
    rules.evidenceAndProductBoundary.uvScoutProductChoices.length === 0 ||
    rules.evidenceAndProductBoundary.notValidatedOrCalculated.length === 0
  ) {
    throw new Error('UV Scout insight messages or recommendation rules are invalid.');
  }
}

validateDefinitions();

const thresholds: Record<ThresholdKey, number> = {
  protection: rules.profileSignals.includeLongestContinuousAtOrAboveUv[0],
  'extra-protection': rules.profileSignals.includeLongestContinuousAtOrAboveUv[1],
};
const elevatedBandKey = rules.guidanceTriggers.elevatedBandKey as UvBandKey;
const extraAttentionBandKey = rules.guidanceTriggers.extraAttentionBandKey as UvBandKey;
const coverageMessageTemplate = definitions.messages[
  rules.forecastCoverage.messageKey as keyof typeof definitions.messages
];
const reapplicationMessageTemplate = definitions.messages[
  rules.sunscreenReminder.messageKey as keyof typeof definitions.messages
];

function formatDuration(seconds: number): string {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hourText = hours ? `${hours} ${hours === 1 ? 'hour' : 'hours'}` : '';
  const minuteText = minutes ? `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}` : '';
  return [hourText, minuteText].filter(Boolean).join(' ');
}

function fillMessage(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);
}

function formatLocalTime(time: number, timezone: string): string {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(new Date(time * 1000));
}

function getProfileDetails(
  summary: OutingForecastSummary,
  timezone: string,
  bandSeconds: Map<UvBandKey, number>,
  longestAtThreshold: Map<ThresholdKey, number>,
): string[] {
  const details = rules.uvBands.flatMap((band) => {
    const seconds = bandSeconds.get(band.key as UvBandKey) ?? 0;
    return seconds > 0
      ? [fillMessage(definitions.messages.bandDuration, {
        duration: formatDuration(seconds),
        bandLabel: band.label,
      })]
      : [];
  });

  details.unshift(fillMessage(definitions.profileMessages.peak, {
    peakUv: summary.highestUv.toFixed(1),
    peakTime: formatLocalTime(summary.highestUvTime, timezone),
  }));
  details.push(fillMessage(definitions.profileMessages.average, {
    averageUv: summary.averageUv.toFixed(1),
  }));

  const longestElevated = longestAtThreshold.get('protection') ?? 0;
  const elevatedSeconds = (bandSeconds.get(elevatedBandKey) ?? 0) +
    (bandSeconds.get(extraAttentionBandKey) ?? 0);
  if (longestElevated > 0 && longestElevated < elevatedSeconds - 60) {
    details.push(fillMessage(definitions.profileMessages.longestElevated, {
      duration: formatDuration(longestElevated),
    }));
  }

  const veryHighSeconds = bandSeconds.get(extraAttentionBandKey) ?? 0;
  const longestVeryHigh = longestAtThreshold.get('extra-protection') ?? 0;
  if (longestVeryHigh > 0 && longestVeryHigh < veryHighSeconds - 60) {
    details.push(fillMessage(definitions.profileMessages.longestVeryHigh, {
      duration: formatDuration(longestVeryHigh),
    }));
  }
  return details;
}

function getExposureProfile(summary: OutingForecastSummary) {
  const bandSeconds = new Map<UvBandKey, number>(expectedBandKeys.map((key) => [key, 0]));
  const currentRun = new Map<ThresholdKey, { end: number; seconds: number }>();
  const longestAtThreshold = new Map<ThresholdKey, number>();
  const orderedHours = [...summary.hours].sort((left, right) => left.time - right.time);

  for (const hour of orderedHours) {
    const overlap = getHourOverlap(hour, summary.startSeconds, summary.endSeconds);
    if (!overlap) continue;

    const band = rules.uvBands.find((candidate) =>
      hour.uv >= candidate.minimumUvInclusive &&
      (candidate.maximumUvExclusive === null || hour.uv < candidate.maximumUvExclusive),
    );
    if (band) {
      const key = band.key as UvBandKey;
      bandSeconds.set(key, (bandSeconds.get(key) ?? 0) + overlap.seconds);
    }

    for (const [key, threshold] of Object.entries(thresholds) as [ThresholdKey, number][]) {
      if (hour.uv < threshold) {
        currentRun.delete(key);
        continue;
      }
      const previous = currentRun.get(key);
      const run = previous?.end === overlap.start
        ? { end: overlap.end, seconds: previous.seconds + overlap.seconds }
        : { end: overlap.end, seconds: overlap.seconds };
      currentRun.set(key, run);
      longestAtThreshold.set(key, Math.max(longestAtThreshold.get(key) ?? 0, run.seconds));
    }
  }
  return { bandSeconds, longestAtThreshold };
}

// Summarize the full covered forecast profile; this is not a personal dose estimate.
export function getUvScoutInsight(summary: OutingForecastSummary, timezone: string): UvScoutInsight {
  if (!Number.isFinite(summary.highestUv) || summary.highestUv < 0) {
    throw new Error('Outing UV Index must be finite and non-negative.');
  }

  const { bandSeconds, longestAtThreshold } = getExposureProfile(summary);
  const elevatedSeconds = (bandSeconds.get(elevatedBandKey) ?? 0) +
    (bandSeconds.get(extraAttentionBandKey) ?? 0);
  const veryHighSeconds = bandSeconds.get(extraAttentionBandKey) ?? 0;
  const headline = elevatedSeconds === 0
    ? definitions.profileMessages.belowThresholdHeadline
    : fillMessage(definitions.profileMessages.elevatedHeadline, {
      duration: formatDuration(elevatedSeconds),
    });

  const practicalGuidance: string[] = [];
  const moderateSeconds = bandSeconds.get(elevatedBandKey) ?? 0;
  if (moderateSeconds > 0) {
    practicalGuidance.push(fillMessage(definitions.profileMessages.moderateAction, {
      duration: formatDuration(moderateSeconds),
    }));
  }
  if (veryHighSeconds > 0) {
    practicalGuidance.push(fillMessage(definitions.profileMessages.veryHighAction, {
      duration: formatDuration(veryHighSeconds),
    }));
  }
  for (const rule of rules.conditionalContextRules) {
    if (summary.highestUv >= rule.whenAnyCoveredUvAtOrAbove) {
      practicalGuidance.push(
        definitions.profileMessages[rule.messageKey as keyof typeof definitions.profileMessages],
      );
    }
  }
  if (elevatedSeconds === 0) practicalGuidance.push(definitions.profileMessages.lowUvContext);

  const coverageMessage = summary.coveredSeconds < summary.requestedSeconds - rules.guidanceTriggers.coverageToleranceSeconds
    ? fillMessage(coverageMessageTemplate, {
      coveredDuration: formatDuration(summary.coveredSeconds),
      plannedDuration: formatDuration(summary.requestedSeconds),
    })
    : null;
  const reapplicationReminder =
    summary.requestedSeconds >= rules.sunscreenReminder.minimumPlannedOutingMinutes * 60 &&
    summary.highestUv >= rules.sunscreenReminder.minimumCoveredUvInclusive
      ? reapplicationMessageTemplate
      : null;

  return {
    note: definitions.note,
    headline,
    explanation: definitions.profileMessages.explanation,
    profileDetails: getProfileDetails(summary, timezone, bandSeconds, longestAtThreshold),
    practicalGuidance,
    coverageMessage,
    reapplicationReminder,
  };
}
