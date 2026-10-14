import definitions from './uvScoutInsight.json';
import rules from './uvScoutRecommendationRules.json';
import { getHourOverlap, type OutingForecastSummary } from '../outing/calculateOutingForecast';
import cloudCoverBands from '../weather/cloudCoverBands.json';

type UvBandKey = 'below-3' | '3-to-8' | '8-plus';

export type UvScoutInsightItem = {
  title: string;
  text: string;
  subItems?: string[];
};

export type UvScoutInsight = {
  practicalGuidance: UvScoutInsightItem[];
  contextNotes: UvScoutInsightItem[];
  breakdown: string[];
  takeaway: string;
  takeawayBullets: string[];
  coverageMessage: string | null;
};

const expectedBandKeys: UvBandKey[] = ['below-3', '3-to-8', '8-plus'];
const veryCloudyBand = cloudCoverBands.find((band) => band.key === 'very-cloudy');

function validateDefinitions() {
  const usedBandKeys = new Set<string>();

  if (rules.schemaVersion !== 3 || !rules.modelNote.trim()) {
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
  const requiredTitles = [
    'protection', 'extraProtection', 'sunscreen', 'cloudyElevatedUv', 'reflectiveConditions',
  ] as const;
  const requiredActions = [
    'protection', 'extraProtection', 'sunscreenBasics', 'sunscreenReapplication',
    'cloudyElevatedUv', 'reflectiveConditions',
  ] as const;
  if (requiredTitles.some((key) => !definitions.bulletTitles[key]?.trim()) ||
    requiredActions.some((key) => !definitions.actionMessages[key]?.trim()) ||
    Object.values(definitions.detailMessages).some((message) => !message.trim()) ||
    Object.values(definitions.profileMessages).some((message) => !message.trim()) ||
    Object.values(definitions.takeawayMessages).some((parts) =>
      parts.length < 2 || parts.some((part) => !part.trim()))) {
    throw new Error('UV Scout action or detail text is incomplete.');
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
    !(rules.forecastCoverage.messageKey in definitions.messages) ||
    rules.weatherContextRules.length === 0 ||
    !veryCloudyBand ||
    new Set(rules.weatherContextRules.map((rule) => rule.key)).size !== rules.weatherContextRules.length ||
    rules.weatherContextRules.some((rule) =>
      !rule.key.trim() || !Number.isFinite(rule.whenUvAtOrAbove) || rule.whenUvAtOrAbove < 0 ||
      !Number.isFinite(rule.whenCloudCoverAtOrAbovePercent) ||
      rule.whenCloudCoverAtOrAbovePercent < 0 || rule.whenCloudCoverAtOrAbovePercent > 100 ||
      rule.whenCloudCoverAtOrAbovePercent !== veryCloudyBand.minimumPercentInclusive ||
      !(rule.messageKey in definitions.actionMessages) || !(rule.messageKey in definitions.bulletTitles),
    )
  ) {
    throw new Error('UV Scout trigger bands or message references do not match the editable definitions.');
  }
  const conditionalRuleKeys = new Set<string>();
  if (rules.conditionalContextRules.length === 0 || rules.conditionalContextRules.some((rule) => {
    const invalid = !rule.key.trim() || conditionalRuleKeys.has(rule.key) ||
      !Number.isFinite(rule.whenAnyCoveredUvAtOrAbove) ||
      rule.whenAnyCoveredUvAtOrAbove !== rules.uvBands[1].minimumUvInclusive ||
      !(rule.messageKey in definitions.actionMessages) ||
      !(rule.messageKey in definitions.bulletTitles);
    conditionalRuleKeys.add(rule.key);
    return invalid;
  })) {
    throw new Error('UV Scout conditional context rules are invalid or duplicated.');
  }

  if (Object.values(definitions.bulletTitles).some((title) => typeof title !== 'string' || !title.trim())) {
    throw new Error('UV Scout insight bullet titles must be non-empty strings.');
  }
  if (
    !definitions.messages.coverageIncomplete.trim() ||
    !Number.isFinite(rules.guidanceTriggers.coverageToleranceSeconds) ||
    rules.guidanceTriggers.coverageToleranceSeconds < 0 ||
    !rules.forecastCoverage.neverFillMissingWithZero ||
    !rules.forecastCoverage.labelIncompleteCoverage ||
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

const elevatedBandKey = rules.guidanceTriggers.elevatedBandKey as UvBandKey;
const extraAttentionBandKey = rules.guidanceTriggers.extraAttentionBandKey as UvBandKey;
const elevatedUv = rules.uvBands[1].minimumUvInclusive;
const veryHighUv = rules.uvBands[2].minimumUvInclusive;
const coverageMessageTemplate = definitions.messages[
  rules.forecastCoverage.messageKey as keyof typeof definitions.messages
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
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    if (!(key in values)) throw new Error(`Missing UV Scout message value: ${key}.`);
    return values[key];
  });
}

function createInsightItem(
  titleKey: keyof typeof definitions.bulletTitles,
  text: string,
  subItems?: string[],
): UvScoutInsightItem {
  return { title: definitions.bulletTitles[titleKey], text, subItems };
}

function formatLocalTime(time: number, timezone: string): string {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(new Date(time * 1000));
}

function formatLocalDate(time: number, timezone: string): string {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  }).format(new Date(time * 1000));
}

type UvPeriod = { start: number; end: number };

function getUvPeriods(
  summary: OutingForecastSummary,
  matches: (hour: OutingForecastSummary['hours'][number]) => boolean,
): UvPeriod[] {
  const intervals = [...summary.hours]
    .sort((left, right) => left.time - right.time)
    .flatMap((hour) => {
      const overlap = getHourOverlap(hour, summary.startSeconds, summary.endSeconds);
      return overlap && matches(hour) ? [overlap] : [];
    });
  const periods: UvPeriod[] = [];
  for (const interval of intervals) {
    const previous = periods.at(-1);
    if (previous && interval.start <= previous.end) previous.end = Math.max(previous.end, interval.end);
    else periods.push({ start: interval.start, end: interval.end });
  }
  return periods;
}

function describePeriods(periods: UvPeriod[], timezone: string): string {
  const firstTwo = periods.slice(0, 2).map(({ start, end }) => {
    const date = formatLocalDate(start, timezone);
    const startTime = formatLocalTime(start, timezone);
    const endTime = formatLocalTime(end, timezone);
    return formatLocalDate(start, timezone) === formatLocalDate(end - 1, timezone)
      ? `${date} ${startTime}-${endTime}`
      : `${date} ${startTime}-${formatLocalDate(end, timezone)} ${endTime}`;
  });
  const remaining = periods.length - firstTwo.length;
  return remaining > 0
    ? `${firstTwo.join(', ')} and ${remaining} more ${remaining === 1 ? 'period' : 'periods'}`
    : firstTwo.join(' and ');
}

function getExposureProfile(summary: OutingForecastSummary) {
  const bandSeconds = new Map<UvBandKey, number>(expectedBandKeys.map((key) => [key, 0]));
  for (const hour of summary.hours) {
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
  }
  return bandSeconds;
}

function getBreakdown(summary: OutingForecastSummary, timezone: string): string[] {
  const hours = [...summary.hours].sort((left, right) => left.time - right.time);
  const firstUv = hours[0].uv.toFixed(1);
  const lastUv = hours[hours.length - 1].uv.toFixed(1);
  const coveredDuration = formatDuration(summary.coveredSeconds);
  const displayedUv = (uv: number) => Number(uv.toFixed(1));
  const minimumUv = Math.min(...hours.map((hour) => displayedUv(hour.uv)));
  const maximumUv = Math.max(...hours.map((hour) => displayedUv(hour.uv)));
  const trend = minimumUv === maximumUv
    ? [fillMessage(definitions.profileMessages.steady, {
      uv: maximumUv.toFixed(1), coveredDuration, averageUv: summary.averageUv.toFixed(1),
    })]
    : [fillMessage(definitions.profileMessages.startEndAverage, {
      startUv: firstUv,
      endUv: lastUv,
      averageUv: summary.averageUv.toFixed(1),
    })];

  if (minimumUv !== maximumUv) {
    const highestPeriods = getUvPeriods(summary, ({ uv }) => displayedUv(uv) === maximumUv);
    const lowestPeriods = getUvPeriods(summary, ({ uv }) => displayedUv(uv) === minimumUv);
    const betweenPeriods = getUvPeriods(summary, ({ uv }) =>
      displayedUv(uv) > minimumUv && displayedUv(uv) < maximumUv,
    );
    const totalSeconds = (periods: UvPeriod[]) =>
      periods.reduce((total, period) => total + period.end - period.start, 0);
    trend.push(fillMessage(definitions.profileMessages.highest, {
      uv: maximumUv.toFixed(1),
      duration: formatDuration(totalSeconds(highestPeriods)),
      periods: describePeriods(highestPeriods, timezone),
    }));
    trend.push(fillMessage(definitions.profileMessages.lowest, {
      uv: minimumUv.toFixed(1),
      duration: formatDuration(totalSeconds(lowestPeriods)),
      periods: describePeriods(lowestPeriods, timezone),
    }));
    if (betweenPeriods.length > 0) {
      const betweenValues = hours.map((hour) => displayedUv(hour.uv))
        .filter((uv) => uv > minimumUv && uv < maximumUv);
      const minimumBetweenUv = Math.min(...betweenValues);
      const maximumBetweenUv = Math.max(...betweenValues);
      const duration = formatDuration(totalSeconds(betweenPeriods));
      trend.push(minimumBetweenUv === maximumBetweenUv
        ? fillMessage(definitions.profileMessages.betweenSingle, {
          uv: minimumBetweenUv.toFixed(1), duration,
        })
        : fillMessage(definitions.profileMessages.betweenRange, {
          minimumUv: minimumBetweenUv.toFixed(1),
          maximumUv: maximumBetweenUv.toFixed(1),
          duration,
        }));
    }
  }

  return trend;
}

// Build the takeaway, breakdown, and actions from covered forecast hours.
export function getUvScoutInsight(summary: OutingForecastSummary, timezone: string): UvScoutInsight {
  if (!Number.isFinite(summary.highestUv) || summary.highestUv < 0) {
    throw new Error('Outing UV Index must be finite and non-negative.');
  }

  const bandSeconds = getExposureProfile(summary);
  const elevatedSeconds = (bandSeconds.get(elevatedBandKey) ?? 0) +
    (bandSeconds.get(extraAttentionBandKey) ?? 0);
  const veryHighSeconds = bandSeconds.get(extraAttentionBandKey) ?? 0;
  const elevatedPeriods = getUvPeriods(summary, ({ uv }) => uv >= elevatedUv);
  const veryHighPeriods = getUvPeriods(summary, ({ uv }) => uv >= veryHighUv);
  const coverageComplete = summary.coveredSeconds >=
    summary.requestedSeconds - rules.guidanceTriggers.coverageToleranceSeconds;

  const practicalGuidance: UvScoutInsightItem[] = [];
  const contextNotes: UvScoutInsightItem[] = [];
  if (elevatedSeconds > 0) {
    const coveredDuration = formatDuration(summary.coveredSeconds);
    const exposure = elevatedPeriods.length > 1
      ? fillMessage(definitions.profileMessages.elevatedSeparated, {
        count: String(elevatedPeriods.length),
        duration: formatDuration(elevatedSeconds),
      })
      : elevatedSeconds >= summary.coveredSeconds
        ? fillMessage(definitions.profileMessages.elevatedAll, { coveredDuration })
        : fillMessage(definitions.profileMessages.elevatedPart, {
          duration: formatDuration(elevatedSeconds),
        });
    const periodText = (periods: UvPeriod[]) => fillMessage(definitions.detailMessages.periods, {
      periods: describePeriods(periods, timezone),
    });
    practicalGuidance.push(createInsightItem(
      'protection', definitions.actionMessages.protection,
      [`${exposure} ${periodText(elevatedPeriods)}`],
    ));
    if (veryHighSeconds > 0) {
      const veryHighTiming = fillMessage(definitions.profileMessages.veryHigh, {
        duration: formatDuration(veryHighSeconds),
      });
      practicalGuidance.push(createInsightItem(
        'extraProtection', definitions.actionMessages.extraProtection,
        [`${veryHighTiming} ${periodText(veryHighPeriods)}`],
      ));
    }
    practicalGuidance.push(createInsightItem(
      'sunscreen', `${definitions.actionMessages.sunscreenBasics} ${definitions.actionMessages.sunscreenReapplication}`,
    ));
    for (const rule of rules.weatherContextRules) {
      const matchingPeriods = getUvPeriods(summary, (hour) =>
        hour.cloudCover !== null && hour.cloudCover >= rule.whenCloudCoverAtOrAbovePercent &&
        hour.uv >= rule.whenUvAtOrAbove,
      );
      if (matchingPeriods.length > 0) {
        contextNotes.push(createInsightItem(
          rule.messageKey as keyof typeof definitions.bulletTitles,
          fillMessage(definitions.actionMessages[
            rule.messageKey as keyof typeof definitions.actionMessages
          ], { periods: describePeriods(matchingPeriods, timezone) }),
        ));
      }
    }
    for (const rule of rules.conditionalContextRules) {
      if (summary.highestUv >= rule.whenAnyCoveredUvAtOrAbove) {
        contextNotes.push(createInsightItem(
          rule.messageKey as keyof typeof definitions.bulletTitles,
          definitions.actionMessages[rule.messageKey as keyof typeof definitions.actionMessages],
        ));
      }
    }
  }

  const takeawayKey = elevatedSeconds === 0
    ? (coverageComplete ? 'lowComplete' : 'lowPartial')
    : veryHighSeconds > 0
      ? (elevatedPeriods.length > 1 ? 'extraProtectionSeparated' : 'extraProtection')
      : (elevatedPeriods.length > 1 ? 'protectionSeparated' : 'protection');
  const takeawayValues = {
    duration: formatDuration(elevatedSeconds === 0 ? summary.coveredSeconds : elevatedSeconds),
    veryHighDuration: formatDuration(veryHighSeconds),
    peakUv: summary.highestUv.toFixed(1),
    peakTime: formatLocalTime(summary.highestUvTime, timezone),
  };
  const takeawayBullets = definitions.takeawayMessages[takeawayKey]
    .map((message) => fillMessage(message, takeawayValues));
  const takeaway = takeawayBullets.join(' ');
  const coverageMessage = !coverageComplete
    ? fillMessage(coverageMessageTemplate, {
      coveredDuration: formatDuration(summary.coveredSeconds),
      plannedDuration: formatDuration(summary.requestedSeconds),
    })
    : null;
  return {
    practicalGuidance,
    contextNotes,
    breakdown: getBreakdown(summary, timezone),
    takeaway,
    takeawayBullets,
    coverageMessage,
  };
}
