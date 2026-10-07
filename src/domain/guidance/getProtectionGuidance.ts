import definitions from './protectionGuidance.json';
import { getHourOverlap, type OutingForecastSummary } from '../outing/calculateOutingForecast';

export type GuidanceLevelKey = 'low' | 'protection' | 'extra-protection';

type UvBandKey = 'below-3' | '3-to-8' | '8-plus';

export type OutingRecommendation = {
  level: GuidanceLevelKey;
  whoGuidanceNote: string;
  uvScoutInsightNote: string;
  insightHeadline: string;
  insightExplanation: string;
  actions: string[];
  exposureObservations: string[];
  coverageMessage: string | null;
  reapplicationReminder: string | null;
};

const expectedLevelKeys: GuidanceLevelKey[] = ['low', 'protection', 'extra-protection'];
const expectedBandKeys: UvBandKey[] = ['below-3', '3-to-8', '8-plus'];

function isOneOf<T extends string>(value: string, options: T[]): value is T {
  return options.includes(value as T);
}

function validateDefinitions() {
  const usedLevelKeys = new Set<string>();
  const usedBandKeys = new Set<string>();

  for (const [index, band] of definitions.uvBands.entries()) {
    const previousBand = definitions.uvBands[index - 1];
    if (
      !isOneOf(band.key, expectedBandKeys) || usedBandKeys.has(band.key) ||
      !band.label.trim() || !Number.isFinite(band.minimumUvInclusive) ||
      (index === 0
        ? band.minimumUvInclusive !== 0
        : band.minimumUvInclusive !== previousBand.maximumUvExclusive) ||
      (band.maximumUvExclusive !== null &&
        (!Number.isFinite(band.maximumUvExclusive) || band.maximumUvExclusive <= band.minimumUvInclusive)) ||
      (index === definitions.uvBands.length - 1 && band.maximumUvExclusive !== null) ||
      (index < definitions.uvBands.length - 1 && band.maximumUvExclusive === null)
    ) {
      throw new Error(`Invalid or duplicate UV exposure band: ${band.key}.`);
    }
    usedBandKeys.add(band.key);
  }
  if (expectedBandKeys.some((key) => !usedBandKeys.has(key))) {
    throw new Error('All three UV exposure bands must be defined.');
  }

  for (const [index, level] of definitions.levels.entries()) {
    if (
      !isOneOf(level.key, expectedLevelKeys) || usedLevelKeys.has(level.key) ||
      !level.insightHeadline.trim() || !level.insightExplanation.trim() ||
      !Number.isFinite(level.minimumUvInclusive) ||
      (index === 0
        ? level.minimumUvInclusive !== 0
        : level.minimumUvInclusive <= definitions.levels[index - 1].minimumUvInclusive) ||
      !Array.isArray(level.actions) || level.actions.length === 0 ||
      level.actions.some((action) => typeof action !== 'string' || !action.trim())
    ) {
      throw new Error(`Invalid or duplicate protection guidance level: ${level.key}.`);
    }
    usedLevelKeys.add(level.key);
  }
  if (expectedLevelKeys.some((key) => !usedLevelKeys.has(key))) {
    throw new Error('All three protection guidance levels must be defined.');
  }

  const protectionMinimum = definitions.levels.find(
    (level) => level.key === 'protection',
  )!.minimumUvInclusive;
  const extraProtectionMinimum = definitions.levels.find(
    (level) => level.key === 'extra-protection',
  )!.minimumUvInclusive;
  if (
    definitions.levels[0].key !== 'low' ||
    definitions.levels[1].key !== 'protection' ||
    definitions.levels[2].key !== 'extra-protection' ||
    definitions.uvBands.find((band) => band.key === '3-to-8')!.minimumUvInclusive !== protectionMinimum ||
    definitions.uvBands.find((band) => band.key === '8-plus')!.minimumUvInclusive !== extraProtectionMinimum
  ) {
    throw new Error('UV exposure band boundaries must match protection-level thresholds.');
  }

  if (
    !definitions.messages.whoGuidanceNote.trim() ||
    !definitions.messages.uvScoutInsightNote.trim() ||
    !definitions.messages.coverageIncomplete.trim() ||
    !definitions.messages.bandDuration.trim() ||
    !definitions.messages.splitExposure.trim() ||
    !definitions.messages.splitVeryHighExposure.trim() ||
    !definitions.messages.reapplication.trim() ||
    !Number.isFinite(definitions.reapplicationRule.minimumOutingMinutes) ||
    definitions.reapplicationRule.minimumOutingMinutes <= 0 ||
    !Number.isFinite(definitions.reapplicationRule.minimumUvInclusive) ||
    definitions.reapplicationRule.minimumUvInclusive < 0
  ) {
    throw new Error('Recommendation messages or reapplication rule are invalid.');
  }
}

validateDefinitions();

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

function getExposureObservations(summary: OutingForecastSummary): string[] {
  const bandSeconds = new Map<UvBandKey, number>(expectedBandKeys.map((key) => [key, 0]));
  const thresholdRuns = new Map<GuidanceLevelKey, { end: number; seconds: number }>();
  const longestAtThreshold = new Map<GuidanceLevelKey, number>();
  const orderedHours = [...summary.hours].sort((left, right) => left.time - right.time);

  for (const hour of orderedHours) {
    const overlap = getHourOverlap(hour, summary.startSeconds, summary.endSeconds);
    if (!overlap) continue;

    for (const band of definitions.uvBands) {
      if (hour.uv < band.minimumUvInclusive ||
        (band.maximumUvExclusive !== null && hour.uv >= band.maximumUvExclusive)) continue;
      const key = band.key as UvBandKey;
      bandSeconds.set(key, (bandSeconds.get(key) ?? 0) + overlap.seconds);
      break;
    }

    for (const key of ['protection', 'extra-protection'] as const) {
      const threshold = definitions.levels.find((level) => level.key === key)!.minimumUvInclusive;
      const previousRun = thresholdRuns.get(key);
      if (hour.uv >= threshold) {
        const run = previousRun && previousRun.end === overlap.start
          ? { end: overlap.end, seconds: previousRun.seconds + overlap.seconds }
          : { end: overlap.end, seconds: overlap.seconds };
        thresholdRuns.set(key, run);
        longestAtThreshold.set(key, Math.max(longestAtThreshold.get(key) ?? 0, run.seconds));
      } else {
        thresholdRuns.delete(key);
      }
    }
  }

  const elevatedSeconds = (bandSeconds.get('3-to-8') ?? 0) + (bandSeconds.get('8-plus') ?? 0);
  if (elevatedSeconds === 0) return [];

  const observations: string[] = [];
  for (const band of definitions.uvBands) {
    const seconds = bandSeconds.get(band.key as UvBandKey) ?? 0;
    if (seconds > 0) {
      observations.push(fillMessage(definitions.messages.bandDuration, {
        duration: formatDuration(seconds),
        bandLabel: band.label,
      }));
    }
  }

  const longestElevated = longestAtThreshold.get('protection') ?? 0;
  if (longestElevated < elevatedSeconds - 60) {
    observations.push(fillMessage(definitions.messages.splitExposure, {
      duration: formatDuration(longestElevated),
    }));
  }
  const veryHighSeconds = bandSeconds.get('8-plus') ?? 0;
  const longestVeryHigh = longestAtThreshold.get('extra-protection') ?? 0;
  if (longestVeryHigh > 0 && longestVeryHigh < veryHighSeconds - 60) {
    observations.push(fillMessage(definitions.messages.splitVeryHighExposure, {
      duration: formatDuration(longestVeryHigh),
    }));
  }
  return observations;
}

// Apply editable guidance to the calculated outing profile; values remain forecast summaries, not personal dose.
export function getOutingRecommendation(summary: OutingForecastSummary): OutingRecommendation {
  if (!Number.isFinite(summary.highestUv) || summary.highestUv < 0) {
    throw new Error('Outing UV Index must be finite and non-negative.');
  }

  const level = definitions.levels.findLast((candidate) => summary.highestUv >= candidate.minimumUvInclusive);
  if (!level) throw new Error('No protection guidance is defined for this outing.');

  const coverageMessage = summary.coveredSeconds < summary.requestedSeconds - 1
    ? fillMessage(definitions.messages.coverageIncomplete, {
      coveredDuration: formatDuration(summary.coveredSeconds),
      plannedDuration: formatDuration(summary.requestedSeconds),
    })
    : null;
  const protectionThreshold = definitions.levels.find((candidate) => candidate.key === 'protection')!.minimumUvInclusive;
  const reapplicationReminder =
    summary.requestedSeconds >= definitions.reapplicationRule.minimumOutingMinutes * 60 &&
    summary.highestUv >= Math.max(protectionThreshold, definitions.reapplicationRule.minimumUvInclusive)
      ? definitions.messages.reapplication
      : null;

  return {
    level: level.key as GuidanceLevelKey,
    whoGuidanceNote: definitions.messages.whoGuidanceNote,
    uvScoutInsightNote: definitions.messages.uvScoutInsightNote,
    insightHeadline: level.insightHeadline,
    insightExplanation: level.insightExplanation,
    actions: [...level.actions],
    exposureObservations: getExposureObservations(summary),
    coverageMessage,
    reapplicationReminder,
  };
}
