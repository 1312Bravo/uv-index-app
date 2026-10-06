import definitions from './protectionGuidance.json';
import type { ShadeLevel } from '../outing/shadeOptions';
import type { UvCategory } from '../uv/getUvCategory';

export type GuidanceLevelKey = 'low' | 'protection' | 'extra-protection';

export type ProtectionGuidance = {
  level: GuidanceLevelKey;
  headline: string;
  explanation: string;
  actions: string[];
  shadeMessage?: string;
};

const uvCategories: UvCategory[] = ['low', 'moderate', 'high', 'very-high', 'extreme'];
const shadeLevels: ShadeLevel[] = ['open-sun', 'mostly-sun', 'mixed-sun-and-shade', 'overhead-cover'];
const guidanceLevels: GuidanceLevelKey[] = ['low', 'protection', 'extra-protection'];

function isOneOf<T extends string>(value: string, options: T[]): value is T {
  return options.includes(value as T);
}

function validateDefinitions() {
  const usedCategories = new Set<string>();
  const usedShadeLevels = new Set<string>();
  const usedGuidanceLevels = new Set<string>();

  for (const level of definitions.levels) {
    if (!isOneOf(level.key, guidanceLevels) || usedGuidanceLevels.has(level.key)) {
      throw new Error(`Invalid or duplicate guidance level: ${level.key}.`);
    }
    usedGuidanceLevels.add(level.key);
    if (!level.headline.trim() || !level.explanation.trim() || level.actions.length === 0) {
      throw new Error(`Guidance level ${level.key} is missing user-facing content.`);
    }
    for (const category of level.categories) {
      if (!isOneOf(category, uvCategories) || usedCategories.has(category)) {
        throw new Error(`Invalid or duplicate UV category in guidance: ${category}.`);
      }
      usedCategories.add(category);
    }
  }

  if (uvCategories.some((category) => !usedCategories.has(category))) {
    throw new Error('Every UV category must map to a protection guidance level.');
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

// Select baseline guidance from the rounded category, adding shade context when provided.
export function getProtectionGuidance(category: UvCategory, shade?: ShadeLevel): ProtectionGuidance {
  const level = definitions.levels.find((candidate) => candidate.categories.includes(category));
  const shadeMessage = shade
    ? definitions.shadeMessages.find((candidate) => candidate.key === shade)?.message
    : undefined;

  if (!level || (shade && !shadeMessage)) throw new Error('No protection guidance is defined for this outing.');

  return {
    level: level.key as GuidanceLevelKey,
    headline: level.headline,
    explanation: level.explanation,
    actions: [...level.actions],
    ...(shadeMessage ? { shadeMessage } : {}),
  };
}
