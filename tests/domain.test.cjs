const assert = require('node:assert/strict');
const { test } = require('node:test');

const domainBuild = '../node_modules/.cache/uv-scout-domain-tests/domain';
const { getUvScoutInsight } = require(`${domainBuild}/guidance/getUvScoutInsight.js`);
const { getWhoGuidanceTable } = require(`${domainBuild}/guidance/getWhoGuidance.js`);
const { summarizeOutingForecast } = require(`${domainBuild}/outing/calculateOutingForecast.js`);
const { getUvCategory } = require(`${domainBuild}/uv/getUvCategory.js`);

function hour(time, uv, overrides = {}) {
  return {
    time,
    uv,
    temperature: 20,
    cloudCover: 50,
    precipitationProbability: null,
    precipitation: null,
    windSpeed: 5,
    period: 'future',
    ...overrides,
  };
}

function forecast(hours) {
  return { timezone: 'UTC', hours, daylight: [] };
}

function summarize(hours, start, end) {
  return summarizeOutingForecast(forecast(hours), new Date(start * 1000), new Date(end * 1000));
}

test('WHO reference returns its three general action bands', () => {
  const table = getWhoGuidanceTable();

  assert.deepEqual(table.bands.map(({ range }) => range), ['0–2', '3–7', '8+']);
  assert.ok(table.bands.every(({ actions }) => actions.length > 0));
  assert.match(table.context, /duration and frequency/i);
});

test('UV display category rounds decimal values with .5 upward', () => {
  assert.equal(getUvCategory(2.4).key, 'low');
  assert.equal(getUvCategory(2.5).key, 'moderate');
  assert.equal(getUvCategory(5.5).key, 'high');
});

test('outing averages weight partial first and last hours by their overlap', () => {
  const result = summarize([
    hour(0, 2, { temperature: 10 }),
    hour(3600, 6, { temperature: 20 }),
  ], 1800, 5400);

  assert.equal(result.coveredSeconds, 3600);
  assert.equal(result.highestUv, 6);
  assert.equal(result.highestUvTime, 3600);
  assert.equal(result.averageUv, 4);
  assert.equal(result.averageTemperature, 15);
});

test('missing forecast time is disclosed and breaks a continuous UV period', () => {
  const result = summarize([hour(0, 4), hour(7200, 4)], 0, 10800);
  const insight = getUvScoutInsight(result, 'UTC');

  assert.equal(result.coveredSeconds, 7200);
  assert.deepEqual(result.missingIntervals, [{ start: 3600, end: 7200 }]);
  assert.match(insight.coverageMessage, /2 hours of this 3 hours outing/);
  assert.ok(insight.profileDetails.some((detail) => detail.text.includes('without a break') && detail.text.includes('1 hour')));
  assert.ok(insight.profileDetails.every((detail) => detail.title && detail.text));
});

test('precipitation totals include only complete preceding-hour amounts', () => {
  const result = summarize([
    hour(0, 1),
    hour(3600, 2, { precipitation: 0.4, precipitationProbability: 30 }),
    hour(7200, 2, { precipitation: 1.2, precipitationProbability: 70 }),
  ], 0, 7200);

  assert.equal(result.completePrecipitationHours, 2);
  assert.equal(result.expectedPrecipitationMm, 1.6);
  assert.equal(result.peakHourlyPrecipitationProbability, 70);
});

test('action guidance gives concrete protection steps for moderate and very high UV', () => {
  const moderate = getUvScoutInsight(summarize([hour(0, 5), hour(3600, 5)], 0, 7200), 'UTC');
  const veryHigh = getUvScoutInsight(summarize([hour(0, 8)], 0, 1800), 'UTC');
  const moderateActions = moderate.practicalGuidance.map(({ text }) => text).join(' ');
  const veryHighAction = veryHigh.practicalGuidance.find(({ title }) => title === 'Extra protection');

  assert.match(moderateActions, /broad-brimmed hat/i);
  assert.match(moderateActions, /broad-spectrum SPF 30\+/i);
  assert.match(moderateActions, /12:00 AM–2:00 AM/i);
  assert.match(veryHighAction.text, /Thu, Jan 1 12:00 AM–12:30 AM/i);
  assert.match(veryHighAction.text, /spend those hours in shade/i);
});

test('very cloudy hours overlapping elevated UV add a targeted cloud-context action only', () => {
  const overlap = getUvScoutInsight(summarize([
    hour(0, 5, { cloudCover: 90 }),
    hour(3600, 5, { cloudCover: 40 }),
    hour(7200, 2, { cloudCover: 100 }),
  ], 0, 10800), 'UTC');
  const cloudAction = overlap.practicalGuidance.find(({ title }) => title === 'Clouds and UV');

  assert.match(cloudAction.text, /very cloudy conditions/i);
  assert.match(cloudAction.text, /Thu, Jan 1 12:00 AM–1:00 AM/i);
  assert.equal(cloudAction.text.includes('1:00 AM–2:00 AM'), false);
  assert.match(cloudAction.text, /follow the UV Index forecast/i);

  const noOverlap = getUvScoutInsight(summarize([
    hour(0, 2, { cloudCover: 100 }),
    hour(3600, 5, { cloudCover: 40 }),
  ], 0, 7200), 'UTC');
  assert.equal(noOverlap.practicalGuidance.some(({ title }) => title === 'Clouds and UV'), false);
});

test('sunscreen advice responds differently to brief and sustained elevated UV', () => {
  const briefHighThenLow = getUvScoutInsight(summarize([
    hour(0, 8), hour(3600, 0), hour(7200, 0), hour(10800, 0), hour(14400, 0),
  ], 0, 18000), 'UTC');
  const sustainedModerate = getUvScoutInsight(summarize([
    hour(0, 7), hour(3600, 7), hour(7200, 7), hour(10800, 7),
  ], 0, 14400), 'UTC');
  const briefActions = briefHighThenLow.practicalGuidance;
  const sustainedReapplication = sustainedModerate.practicalGuidance
    .find(({ title }) => title === 'Reapplication');

  assert.ok(briefActions.some(({ title }) => title === 'Sunscreen'));
  assert.equal(briefActions.some(({ title }) => title === 'Reapplication'), false);
  assert.match(sustainedReapplication.text, /about 4 hours at UV Index 3 or higher/i);
  assert.match(sustainedReapplication.text, /every two hours/i);
  assert.match(sustainedReapplication.text, /does not know when you applied it/i);
});

test('after-water or sweat sunscreen advice remains conditional at any elevated UV duration', () => {
  const low = getUvScoutInsight(summarize([hour(0, 2)], 0, 1800), 'UTC');
  const briefElevated = getUvScoutInsight(summarize([hour(0, 3)], 0, 1800), 'UTC');
  const afterConditions = briefElevated.practicalGuidance
    .find(({ title }) => title === 'After water or sweat');

  assert.equal(low.practicalGuidance.some(({ title }) => title === 'After water or sweat'), false);
  assert.match(afterConditions.text, /after swimming, sweating, or drying off/i);
});
