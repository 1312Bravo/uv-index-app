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

test('sunscreen reminder appears at the configured 120-minute boundary', () => {
  const hours = [hour(0, 4), hour(3600, 4)];
  const beforeBoundary = getUvScoutInsight(summarize(hours, 0, 7140), 'UTC');
  const atBoundary = getUvScoutInsight(summarize(hours, 0, 7200), 'UTC');

  assert.equal(beforeBoundary.reapplicationReminder, null);
  assert.equal(atBoundary.reapplicationReminder.title, 'Reapplication');
  assert.match(atBoundary.reapplicationReminder.text, /at least two hours/i);
});
