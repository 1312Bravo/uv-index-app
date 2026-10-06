import definitions from './protectionGuidance.json';
import type { ShadeLevel } from '../outing/shadeOptions';

export type GuidanceLevelKey = 'low' | 'protection' | 'extra-protection';

export type ProtectionGuidance = {
  level: GuidanceLevelKey;
  headline: string;
  explanation: string;
  actions: string[];
  shadeMessage?: string;
};

const shadeLevels: ShadeLevel[] = ['open-sun', 'mostly-sun', 'mixed-sun-and-shade', 'overhead-cover'];
const guidanceLevels: GuidanceLevelKey[] = ['low', 'protection', 'extra-protection'];

function isOneOf<T extends string>(value: string, options: T[]): value is T {
  return options.includes(value as T);
}

function validateDefinitions() {
  const usedShadeLevels = new Set<string>();
  const usedGuidanceLevels = new Set<string>();

  for (const [index, level] of definitions.levels.entries()) {
    if (!isOneOf(level.key, guidanceLevels) || usedGuidanceLevels.has(level.key)) {
      throw new Error(`Invalid or duplicate guidance level: ${level.key}.`);
    }
    usedGuidanceLevels.add(level.key);
    if (
      !Number.isFinite(level.minimumUvInclusive) ||
      (index === 0
        ? level.minimumUvInclusive !== 0
        : level.minimumUvInclusive <= definitions.levels[index - 1].minimumUvInclusive)
    ) {
      throw new Error(`Invalid UV threshold for guidance level ${level.key}.`);
    }
    if (!level.headline.trim() || !level.explanation.trim() || level.actions.length === 0) {
      throw new Error(`Guidance level ${level.key} is missing user-facing content.`);
    }
  }
  if (guidanceLevels.some((level) => !usedGuidanceLevels.has(level))) {
    throw new Error('All three protection guidance levels must be defined.');
  }

  for (const shade of definitions.shadeMessages) {
    if (!isOneOf(shade.key, shadeLevels) || usedShadeLevels.has(shade.key) || !shade.message.trim()) {
      throw new Error(`Invalid or duplicate shade guidance: ${shade.key}.`);
    }
    usedShadeLevels.add(shade.key);
  }
  if (shadeLevels.some((shade) => !usedShadeLevels.has(shade))) {
    throw new Error('Every shade choice must have a guidance message.');
  }
}

validateDefinitions();

// WHO protection guidance starts at raw UVI 3; category rounding is display-only.
export function getProtectionGuidance(uv: number, shade?: ShadeLevel): ProtectionGuidance {
  if (!Number.isFinite(uv) || uv < 0) throw new Error('UV Index must be a finite, non-negative number.');

  const level = definitions.levels.findLast((candidate) => uv >= candidate.minimumUvInclusive);
  const shadeMessage = shade
    ? definitions.shadeMessages.find((candidate) => candidate.key === shade)?.message
    : undefined;

  if (!level || (shade && !shadeMessage)) {
    throw new Error('No protection guidance is defined for this outing.');
  }

  return {
    level: level.key as GuidanceLevelKey,
    headline: level.headline,
    explanation: level.explanation,
    actions: [...level.actions],
    ...(shadeMessage ? { shadeMessage } : {}),
  };
}
