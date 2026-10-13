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

  assert.deepEqual(table.bands.map(({ range }) => range), ['0-2', '3-7', '8+']);
  assert.ok(table.bands.every(({ actions }) => actions.length > 0));
  assert.match(table.context, /time outdoors also matters/i);
  assert.doesNotMatch(table.bands[0].actions.join(' '), /the forecast stays/i);
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

test('missing forecast time is disclosed and separates elevated UV periods', () => {
  const result = summarize([hour(0, 4), hour(7200, 4)], 0, 10800);
  const insight = getUvScoutInsight(result, 'UTC');

  assert.equal(result.coveredSeconds, 7200);
  assert.deepEqual(result.missingIntervals, [{ start: 3600, end: 7200 }]);
  assert.match(insight.coverageMessage, /2 hours of the planned 3 hours/);
  assert.match(insight.summary, /2 hours in separate periods/i);
  assert.ok(insight.practicalGuidance.every((item) => item.title && item.text));
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
  const veryHighAction = veryHigh.practicalGuidance.find(({ title }) => title === 'Strongest hours');

  assert.match(moderateActions, /broad-brimmed hat/i);
  assert.match(moderateActions, /broad-spectrum SPF 30\+/i);
  assert.match(moderateActions, /12:00 AM-2:00 AM/i);
  assert.match(veryHighAction.text, /Thu, Jan 1 12:00 AM-12:30 AM/i);
  assert.match(veryHighAction.text, /prioritize shade/i);
  assert.match(veryHigh.summary, /30 minutes at UV 8\+/i);
});

test('very cloudy hours overlapping elevated UV add a targeted cloud-context action only', () => {
  const overlap = getUvScoutInsight(summarize([
    hour(0, 5, { cloudCover: 90 }),
    hour(3600, 5, { cloudCover: 40 }),
    hour(7200, 2, { cloudCover: 100 }),
  ], 0, 10800), 'UTC');
  const cloudAction = overlap.practicalGuidance.find(({ title }) => title === 'Cloudy hours');

  assert.match(cloudAction.text, /despite heavy cloud cover/i);
  assert.match(cloudAction.text, /Thu, Jan 1 12:00 AM-1:00 AM/i);
  assert.equal(cloudAction.text.includes('1:00 AM-2:00 AM'), false);
  assert.match(cloudAction.text, /keep UV protection in place/i);

  const noOverlap = getUvScoutInsight(summarize([
    hour(0, 2, { cloudCover: 100 }),
    hour(3600, 5, { cloudCover: 40 }),
  ], 0, 7200), 'UTC');
  assert.equal(noOverlap.practicalGuidance.some(({ title }) => title === 'Cloudy hours'), false);
});

test('sunscreen advice responds differently to brief and sustained elevated UV', () => {
  const briefHighThenLow = getUvScoutInsight(summarize([
    hour(0, 8), hour(3600, 0), hour(7200, 0), hour(10800, 0), hour(14400, 0),
  ], 0, 18000), 'UTC');
  const sustainedModerate = getUvScoutInsight(summarize([
    hour(0, 7), hour(3600, 7), hour(7200, 7), hour(10800, 7),
  ], 0, 14400), 'UTC');
  const briefActions = briefHighThenLow.practicalGuidance;
  const briefSunscreen = briefActions.find(({ title }) => title === 'Sunscreen');
  const sustainedSunscreen = sustainedModerate.practicalGuidance
    .find(({ title }) => title === 'Sunscreen');

  assert.match(briefSunscreen.text, /if you swim, sweat, or towel off/i);
  assert.doesNotMatch(briefSunscreen.text, /every two hours/i);
  assert.match(sustainedSunscreen.text, /every two hours/i);
  assert.equal(sustainedModerate.practicalGuidance.filter(({ title }) => title === 'Sunscreen').length, 1);
  assert.match(briefHighThenLow.summary, /including 1 hour at UV 8\+/i);
});

test('low UV receives an action, while sunscreen advice starts at raw UV 3', () => {
  const low = getUvScoutInsight(summarize([hour(0, 2)], 0, 1800), 'UTC');
  const briefElevated = getUvScoutInsight(summarize([hour(0, 3)], 0, 1800), 'UTC');
  const elevatedSunscreen = briefElevated.practicalGuidance
    .find(({ title }) => title === 'Sunscreen');

  assert.equal(low.practicalGuidance.length, 1);
  assert.match(low.practicalGuidance[0].text, /no extra sun protection/i);
  assert.match(low.summary, /stays below 3 throughout/i);
  assert.match(elevatedSunscreen.text, /if you swim, sweat, or towel off/i);
});

test('protection rules use raw UV 3 and 8 boundaries', () => {
  const adviceAt = (uv) => getUvScoutInsight(summarize([hour(0, uv)], 0, 3600), 'UTC');

  assert.match(adviceAt(2.9).practicalGuidance[0].text, /no extra sun protection/i);
  assert.equal(adviceAt(3).practicalGuidance.some(({ title }) => title === 'Sunscreen'), true);
  assert.equal(adviceAt(7.9).practicalGuidance.some(({ title }) => title === 'Strongest hours'), false);
  assert.equal(adviceAt(8).practicalGuidance.some(({ title }) => title === 'Strongest hours'), true);
});

test('a brief UV 8 window does not describe a mostly low-UV outing as all high UV', () => {
  const result = getUvScoutInsight(summarize([
    hour(0, 8), hour(3600, 0), hour(7200, 0), hour(10800, 0), hour(14400, 0),
  ], 2700, 18000), 'UTC');

  assert.match(result.summary, /15 minutes at UV 8\+/i);
  assert.match(result.summary, /about 15 minutes/i);
  assert.equal(result.practicalGuidance.some(({ title }) => title === 'Strongest hours'), true);
  assert.equal(result.practicalGuidance.some(({ title }) => title === 'Sunscreen'), true);
  assert.doesNotMatch(result.summary, /5 hours at UV 8\+/i);
});

test('missing later forecast never turns a known UV 3+ period into a low-UV result', () => {
  const result = getUvScoutInsight(summarize([hour(0, 4)], 0, 10800), 'UTC');

  assert.match(result.coverageMessage, /1 hour of the planned 3 hours/i);
  assert.match(result.summary, /1 hour/i);
  assert.equal(result.practicalGuidance.some(({ title }) => title === 'Sunscreen'), true);
  assert.doesNotMatch(result.summary, /stays below 3/i);
});

test('low UV with incomplete coverage limits its recommendation to known hours', () => {
  const result = getUvScoutInsight(summarize([hour(0, 1)], 0, 7200), 'UTC');

  assert.match(result.practicalGuidance[0].text, /1 hour with forecast data/i);
  assert.match(result.summary, /1 hour of the outing with forecast data/i);
  assert.doesNotMatch(result.summary, /throughout/i);
  assert.match(result.coverageMessage, /remaining time has no forecast/i);
});

test('separated elevated periods stay distinct and long timing lists stay brief', () => {
  const separated = getUvScoutInsight(summarize([
    hour(0, 4), hour(3600, 1), hour(7200, 4), hour(10800, 1),
    hour(14400, 4), hour(18000, 1), hour(21600, 4),
  ], 0, 25200), 'UTC');
  const protection = separated.practicalGuidance.find(({ title }) => title === 'Protection');
  const sunscreen = separated.practicalGuidance.find(({ title }) => title === 'Sunscreen');

  assert.match(separated.summary, /4 hours in separate periods/i);
  assert.match(protection.text, /and 2 more periods/i);
  assert.match(sunscreen.text, /every two hours while outdoors/i);
  assert.doesNotMatch(sunscreen.text, /continuous|extended elevated/i);
});
