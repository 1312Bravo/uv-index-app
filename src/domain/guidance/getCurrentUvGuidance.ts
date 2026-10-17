import definitions from './currentUvGuidance.json';
import rules from './uvScoutRecommendationRules.json';
import { getUvCategory, getUvCategoryDefinitions } from '../uv/getUvCategory';

type UvBandKey = 'below-3' | '3-to-8' | '8-plus';

export type CurrentUvGuidance = {
  uv: number;
  category: string;
  meaning: string;
  actions: string[];
  cloudNote: string | null;
  categoryNote: string | null;
};

const bandKeys: UvBandKey[] = ['below-3', '3-to-8', '8-plus'];
const bands = rules.uvBands;
const cloudyRule = rules.weatherContextRules.find((rule) => rule.key === 'very-cloudy-during-elevated-uv');

if (
  bands.length !== bandKeys.length ||
  bandKeys.some((key, index) => bands[index].key !== key ||
    bands[index].minimumUvInclusive !== [0, 3, 8][index]) ||
  bands[0].maximumUvExclusive !== 3 ||
  bands[1].maximumUvExclusive !== 8 ||
  bands[2].maximumUvExclusive !== null ||
  bandKeys.some((key) => definitions.actions[key].length === 0 ||
    definitions.actions[key].some((action) => !action.trim())) ||
  !definitions.cloudNote.trim() || !definitions.roundedCategoryNote.trim() ||
  !cloudyRule || cloudyRule.whenUvAtOrAbove !== 3 ||
  cloudyRule.whenCloudCoverAtOrAbovePercent !== 76
) {
  throw new Error('Current UV guidance definitions are incomplete or inconsistent.');
}

// A current reading has no duration, so only the raw UV protection band applies.
export function getCurrentUvGuidance(uv: number, cloudCover: number | null): CurrentUvGuidance {
  if (!Number.isFinite(uv) || uv < 0 ||
    (cloudCover !== null && (!Number.isFinite(cloudCover) || cloudCover < 0 || cloudCover > 100))) {
    throw new Error('Current UV or cloud cover is invalid.');
  }

  const band = bands.find((entry) => uv >= entry.minimumUvInclusive &&
    (entry.maximumUvExclusive === null || uv < entry.maximumUvExclusive));
  if (!band) throw new Error('No protection band covers the current UV value.');

  const category = getUvCategory(uv);
  const meaning = getUvCategoryDefinitions().find((entry) => entry.key === category.key)?.meaning;
  if (!meaning) throw new Error('Current UV category has no description.');

  const categoryCrossesThreshold = (uv < 3 && category.key !== 'low') ||
    (uv < 8 && category.key === 'very-high');

  return {
    uv,
    category: category.label,
    meaning,
    actions: definitions.actions[band.key as UvBandKey],
    cloudNote: uv >= cloudyRule!.whenUvAtOrAbove && cloudCover !== null &&
      cloudCover >= cloudyRule!.whenCloudCoverAtOrAbovePercent
      ? definitions.cloudNote
      : null,
    categoryNote: categoryCrossesThreshold ? definitions.roundedCategoryNote : null,
  };
}
