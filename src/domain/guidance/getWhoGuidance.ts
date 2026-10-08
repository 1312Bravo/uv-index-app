import definitions from './whoGuidance.json';

export type WhoGuidanceLevelKey = 'low' | 'protection' | 'extra-protection';

export type WhoGuidanceBand = {
  level: WhoGuidanceLevelKey;
  range: string;
  label: string;
  actions: string[];
};

export type WhoGuidanceTable = {
  note: string;
  context: string;
  bands: WhoGuidanceBand[];
};

const expectedLevelKeys: WhoGuidanceLevelKey[] = ['low', 'protection', 'extra-protection'];

function validateDefinitions() {
  const usedKeys = new Set<string>();

  if (!definitions.note.trim() || !definitions.context.trim()) {
    throw new Error('WHO guidance note and context must not be empty.');
  }

  for (const [index, level] of definitions.levels.entries()) {
    if (
      !expectedLevelKeys.includes(level.key as WhoGuidanceLevelKey) || usedKeys.has(level.key) ||
      !Number.isFinite(level.minimumUvInclusive) || level.minimumUvInclusive < 0 ||
      typeof level.label !== 'string' || !level.label.trim() ||
      (index === 0
        ? level.minimumUvInclusive !== 0
        : level.minimumUvInclusive <= definitions.levels[index - 1].minimumUvInclusive) ||
      !Array.isArray(level.actions) || level.actions.length === 0 ||
      level.actions.some((action) => typeof action !== 'string' || !action.trim())
    ) {
      throw new Error(`Invalid or duplicate WHO guidance level: ${level.key}.`);
    }
    usedKeys.add(level.key);
  }

  if (
    expectedLevelKeys.some((key) => !usedKeys.has(key)) ||
    definitions.levels.map((level) => level.key).join(',') !== expectedLevelKeys.join(',')
  ) {
    throw new Error('WHO guidance must define low, protection, and extra-protection levels in order.');
  }
}

validateDefinitions();

// Return WHO's general reference table for the Info screen, not an outing-specific result.
export function getWhoGuidanceTable(): WhoGuidanceTable {
  return {
    note: definitions.note,
    context: definitions.context,
    bands: definitions.levels.map((level, index) => {
      const nextLevel = definitions.levels[index + 1];
      const upperBound = nextLevel ? nextLevel.minimumUvInclusive - 1 : null;
      return {
        level: level.key as WhoGuidanceLevelKey,
        range: upperBound === null
          ? `${level.minimumUvInclusive}+`
          : `${level.minimumUvInclusive}–${upperBound}`,
        label: level.label,
        actions: [...level.actions],
      };
    }),
  };
}
