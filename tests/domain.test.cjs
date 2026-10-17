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

function trendLines(insight) {
  return insight.breakdown;
}

function timingLines(insight) {
  return insight.practicalGuidance
    .filter(({ title }) => title === 'Clothing and shade' || title === 'Strongest hours')
    .flatMap(({ subItems }) => subItems ?? []);
}

function actionText(insight, title) {
  const action = insight.practicalGuidance.find((item) => item.title === title);
  assert.ok(action, `Expected ${title} protection step`);
  return action.text;
}

test('WHO reference returns its three general action bands', () => {
  const table = getWhoGuidanceTable();

  assert.deepEqual(table.bands.map(({ range }) => range), ['0-2', '3-7', '8+']);
  assert.ok(table.bands.every(({ actions }) => actions.length > 0));
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

  const insight = getUvScoutInsight(result, 'UTC');
  assert.equal(insight.breakdown.length, 3);
  assert.match(trendLines(insight)[0], /starts at 2\.0 and ends at 6\.0/);
  assert.match(trendLines(insight)[0], /average is 4\.0/);
  assert.match(trendLines(insight)[1], /Highest UV is 6\.0 for about 30 minutes/);
  assert.match(trendLines(insight)[1], /1:00 AM-1:30 AM/);
  assert.doesNotMatch(insight.breakdown.join(' '), /Thu|Jan/);
  assert.match(trendLines(insight)[2], /Lowest UV is 2\.0 for about 30 minutes/);
  assert.match(actionText(insight, 'Clothing and shade'), /UV reaches 3 or higher for about 30 minutes/);
  assert.match(timingLines(insight)[0], /1:00 AM-1:30 AM/);
});

test('missing forecast time is disclosed and separates elevated UV periods', () => {
  const result = summarize([hour(0, 4), hour(7200, 4)], 0, 10800);
  const insight = getUvScoutInsight(result, 'UTC');

  assert.equal(result.coveredSeconds, 7200);
  assert.deepEqual(result.missingIntervals, [{ start: 3600, end: 7200 }]);
  assert.match(insight.coverageMessage, /2 hours of the planned 3 hours/);
  assert.match(insight.takeawayBullets[1], /around 12:00 AM to around 1:00 AM.*around 2:00 AM to around 3:00 AM/i);
  assert.match(insight.takeawayBullets[1], /cover exposed skin/i);
  assert.ok(insight.practicalGuidance.every((item) => item.title && item.text));
  assert.match(actionText(insight, 'Clothing and shade'), /2 separate stretches, totaling about 2 hours/);
  assert.match(timingLines(insight)[0], /12:00 AM-1:00 AM and 2:00 AM-3:00 AM/);
});

test('breakdown describes a sustained peak across consecutive forecast hours', () => {
  const insight = getUvScoutInsight(summarize([
    hour(0, 2), hour(3600, 6), hour(7200, 6), hour(10800, 1),
  ], 0, 14400), 'UTC');

  assert.match(trendLines(insight)[0], /starts at 2\.0 and ends at 1\.0/);
  assert.match(trendLines(insight)[0], /average is 3\.8/);
  assert.match(trendLines(insight)[1], /Highest UV is 6\.0 for about 2 hours/);
  assert.match(trendLines(insight)[1], /1:00 AM-3:00 AM/);
  assert.match(trendLines(insight)[2], /Lowest UV is 1\.0 for about 1 hour/);
  assert.match(trendLines(insight)[3], /remaining forecast hours, UV is 2\.0 for about 1 hour/);
  assert.match(actionText(insight, 'Clothing and shade'), /UV reaches 3 or higher for about 2 hours/);
  assert.match(trendLines(insight)[4], /UV stays below 3 for about 2 hours in total/);
  assert.equal(insight.breakdown.length, 5);
});

test('UV trend totals separated minima and a range of intervening values', () => {
  const insight = getUvScoutInsight(summarize([
    hour(0, 1), hour(3600, 2), hour(7200, 3), hour(10800, 5),
    hour(14400, 5), hour(18000, 1),
  ], 0, 21600), 'UTC');

  assert.match(trendLines(insight)[1], /Highest UV is 5\.0 for about 2 hours/);
  assert.match(trendLines(insight)[2], /Lowest UV is 1\.0 for about 2 hours/);
  assert.match(trendLines(insight)[2], /12:00 AM-1:00 AM and 5:00 AM-6:00 AM/);
  assert.match(trendLines(insight)[3], /remaining forecast hours, UV ranges from 2\.0 to 3\.0 for about 2 hours/);
  assert.match(actionText(insight, 'Clothing and shade'), /UV reaches 3 or higher for about 3 hours/);
  assert.match(trendLines(insight)[4], /UV stays below 3 for about 3 hours in total/);
  assert.match(trendLines(insight)[4], /12:00 AM-2:00 AM and 5:00 AM-6:00 AM/);
});

test('opening takeaway bullets give a compact profile and protection outcome', () => {
  const low = getUvScoutInsight(summarize([hour(0, 2)], 0, 3600), 'UTC');
  const high = getUvScoutInsight(summarize([hour(0, 8), hour(3600, 2)], 0, 7200), 'UTC');

  for (const insight of [low, high]) {
    assert.ok(insight.takeawayBullets.length >= 2);
    assert.equal(insight.takeawayBullets.join(' '), insight.takeaway);
    assert.ok(insight.takeawayBullets.every((bullet) => bullet.length > 0));
  }
  assert.match(low.takeawayBullets[1], /no extra sun protection/i);
  assert.match(low.takeawayBullets[0], /average 2\.0; highest 2\.0/i);
  assert.match(high.takeawayBullets[0], /ranges from 2\.0 to 8\.0 \(average 5\.0\)/i);
  assert.match(high.takeawayBullets[1], /around 12:00 AM to around 1:00 AM.*limit direct sun/i);
  assert.match(high.takeawayBullets[1], /around 1:00 AM to around 2:00 AM.*no extra sun protection/i);
  assert.match(high.takeawayBullets[1], /SPF 30\+/i);
});

test('opening protection changes with the forecast windows without repeating the UV profile', () => {
  const insight = getUvScoutInsight(summarize([
    hour(0, 1), hour(3600, 5), hour(7200, 9), hour(10800, 2),
  ], 0, 14400), 'UTC');
  const protection = insight.takeawayBullets[1];

  assert.match(protection, /12:00 AM to around 1:00 AM.*no extra sun protection/i);
  assert.match(protection, /1:00 AM to around 2:00 AM.*seek shade.*SPF 30\+/i);
  assert.match(protection, /2:00 AM to around 3:00 AM.*prioritize shade.*limit direct sun/i);
  assert.match(protection, /3:00 AM to around 4:00 AM.*no extra sun protection/i);
  assert.doesNotMatch(protection, /average|highest forecast hour/i);
  assert.ok(protection.indexOf('around 12:00 AM') < protection.indexOf('around 1:00 AM to'));
  assert.ok(protection.indexOf('around 1:00 AM to') < protection.indexOf('around 2:00 AM to'));
  assert.ok(protection.indexOf('around 2:00 AM to') < protection.indexOf('around 3:00 AM to'));
});

test('opening protection uses weekday names when its windows cross midnight', () => {
  const insight = getUvScoutInsight(summarize([
    hour(23 * 3600, 5), hour(24 * 3600, 8),
  ], 23 * 3600, 25 * 3600), 'UTC');

  assert.match(insight.takeawayBullets[1], /around Thursday 11:00 PM to around Friday 12:00 AM/i);
  assert.match(insight.takeawayBullets[1], /around Friday 12:00 AM to around 1:00 AM.*limit direct sun/i);
  assert.doesNotMatch(insight.takeawayBullets.join(' '), /Jan|\b1\b,?\s+11:00 PM/i);
  assert.match(timingLines(insight)[0], /Thursday 11:00 PM-Friday 1:00 AM/i);
  assert.match(actionText(insight, 'Sunscreen'), /UV is 3 or higher when this outing starts/i);
});

test('overnight advice identifies the peak and later sunscreen start by weekday', () => {
  const insight = getUvScoutInsight(summarize([
    hour(22 * 3600, 1), hour(23 * 3600, 1),
    hour(24 * 3600, 6), hour(25 * 3600, 6),
  ], 22 * 3600, 26 * 3600), 'UTC');

  assert.match(insight.takeawayBullets[0], /highest forecast hour at Friday 12:00 AM/i);
  assert.match(actionText(insight, 'Sunscreen'), /first forecast UV 3\+ period begins at Friday 12:00 AM/i);
  assert.match(insight.breakdown[1], /Friday 12:00 AM-2:00 AM/i);
  assert.match(timingLines(insight)[0], /Friday 12:00 AM-2:00 AM/i);
  assert.doesNotMatch(insight.breakdown.join(' '), /Jan/);
});

test('opening protection rounds start down and end up to local half hours only for display', () => {
  const insight = getUvScoutInsight(summarize([
    hour(3600, 5), hour(7200, 5), hour(10800, 5), hour(14400, 5),
  ], 3600 + 53 * 60, 4 * 3600 + 54 * 60), 'UTC');

  assert.match(insight.takeawayBullets[1], /around 1:30 AM to around 5:00 AM/i);
  assert.match(timingLines(insight)[0], /1:53 AM-4:54 AM/i);
});

test('rounding a single-day outing end to midnight does not add a weekday', () => {
  const insight = getUvScoutInsight(summarize([
    hour(22 * 3600, 5), hour(23 * 3600, 5),
  ], 22 * 3600 + 10 * 60, 23 * 3600 + 40 * 60), 'UTC');

  assert.match(insight.takeawayBullets[1], /around 10:00 PM to around 12:00 AM/i);
  assert.doesNotMatch(insight.takeawayBullets.join(' '), /Thursday|Friday|Jan/);
});

test('opening half-hour rounding follows local time in quarter-hour-offset zones', () => {
  const day = Date.UTC(2026, 9, 15) / 1000;
  const insight = getUvScoutInsight(summarize([
    hour(day, 5),
  ], day + 8 * 60, day + 54 * 60), 'Asia/Kathmandu');

  assert.match(insight.takeawayBullets[1], /around 5:30 AM to around 7:00 AM/i);
});

test('changing low UV still gets a numerical outing description without protection windows', () => {
  const insight = getUvScoutInsight(summarize([
    hour(0, 1), hour(3600, 2), hour(7200, 1),
  ], 0, 10800), 'UTC');

  assert.match(trendLines(insight)[0], /average is 1\.3/);
  assert.match(trendLines(insight)[1], /Highest UV is 2\.0 for about 1 hour/);
  assert.match(trendLines(insight)[1], /1:00 AM-2:00 AM/);
  assert.match(insight.takeaway, /below 3 throughout this outing/);
  assert.deepEqual(timingLines(insight), []);
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
  assert.doesNotMatch(moderateActions, /12:00 AM-2:00 AM/i);
  assert.match(timingLines(moderate)[0],
    /12:00 AM-2:00 AM/i);
  assert.match(timingLines(veryHigh)[1],
    /12:00 AM-12:30 AM/i);
  assert.doesNotMatch(veryHighAction.text, /12:00 AM-12:30 AM/i);
  assert.match(veryHighAction.text, /prioritize shade/i);
  assert.match(veryHighAction.text, /UV reaches 8 or higher for about 30 minutes/i);
  assert.match(veryHigh.takeawayBullets[1], /around 12:00 AM to around 12:30 AM/i);
  assert.match(veryHigh.takeaway, /limit direct sun/i);
  assert.deepEqual(moderate.practicalGuidance.map(({ title }) => title), [
    'Sunscreen', 'Clothing and shade', 'Reapply sunscreen',
  ]);
  assert.deepEqual(veryHigh.practicalGuidance.map(({ title }) => title), [
    'Sunscreen', 'Clothing and shade', 'Strongest hours', 'Reapply sunscreen',
  ]);
});

test('very cloudy hours overlapping elevated UV add a targeted cloud-context action only', () => {
  const overlap = getUvScoutInsight(summarize([
    hour(0, 5, { cloudCover: 90 }),
    hour(3600, 5, { cloudCover: 40 }),
    hour(7200, 2, { cloudCover: 100 }),
  ], 0, 10800), 'UTC');
  const cloudAction = overlap.contextNotes.find(({ title }) => title === 'Cloudy hours');

  assert.match(cloudAction.text, /despite heavy cloud cover/i);
  assert.match(cloudAction.text, /12:00 AM-1:00 AM/i);
  assert.equal(cloudAction.text.includes('1:00 AM-2:00 AM'), false);
  assert.match(cloudAction.text, /keep UV protection in place/i);

  const noOverlap = getUvScoutInsight(summarize([
    hour(0, 2, { cloudCover: 100 }),
    hour(3600, 5, { cloudCover: 40 }),
  ], 0, 7200), 'UTC');
  assert.equal(noOverlap.contextNotes.some(({ title }) => title === 'Cloudy hours'), false);
  assert.equal(overlap.practicalGuidance.some(({ title }) => title === 'Cloudy hours'), false);
  assert.equal(overlap.contextNotes.some(({ title }) => title === 'Bright surfaces'), true);
});

test('sunscreen reapplication advice does not depend on cumulative elevated-UV duration', () => {
  const briefHighThenLow = getUvScoutInsight(summarize([
    hour(0, 8), hour(3600, 0), hour(7200, 0), hour(10800, 0), hour(14400, 0),
  ], 0, 18000), 'UTC');
  const lateElevatedHour = getUvScoutInsight(summarize([
    hour(0, 0), hour(3600, 0), hour(7200, 0), hour(10800, 0), hour(14400, 5),
  ], 0, 18000), 'UTC');
  const sustainedModerate = getUvScoutInsight(summarize([
    hour(0, 7), hour(3600, 7), hour(7200, 7), hour(10800, 7),
  ], 0, 14400), 'UTC');
  const briefActions = briefHighThenLow.practicalGuidance;
  const briefSunscreen = briefActions.find(({ title }) => title === 'Sunscreen');
  const lateSunscreen = lateElevatedHour.practicalGuidance.find(({ title }) => title === 'Sunscreen');
  const sustainedSunscreen = sustainedModerate.practicalGuidance
    .find(({ title }) => title === 'Sunscreen');

  const briefReapplication = briefActions.find(({ title }) => title === 'Reapply sunscreen');
  const sustainedReapplication = sustainedModerate.practicalGuidance
    .find(({ title }) => title === 'Reapply sunscreen');

  assert.match(briefReapplication.text, /reapply at least every two hours/i);
  assert.match(briefReapplication.text, /follow the product label/i);
  assert.match(briefReapplication.text, /sooner after swimming, sweating, or towel drying/i);
  assert.match(lateSunscreen.text, /first forecast UV 3\+ period begins at 4:00 AM/i);
  assert.match(lateSunscreen.text, /before then/i);
  assert.doesNotMatch(lateSunscreen.text, /Thursday|Jan/);
  assert.match(briefSunscreen.text, /UV is 3 or higher when this outing starts/i);
  assert.equal(briefSunscreen.text, sustainedSunscreen.text);
  assert.match(sustainedReapplication.text, /reapply at least every two hours/i);
  assert.equal(briefReapplication.text, sustainedReapplication.text);
  assert.equal(sustainedModerate.practicalGuidance.filter(({ title }) => title === 'Sunscreen').length, 1);
  assert.match(briefHighThenLow.takeawayBullets[1], /around 12:00 AM to around 1:00 AM.*limit direct sun/i);
});

test('low UV gets a practical takeaway without duplicate steps, while sunscreen starts at raw UV 3', () => {
  const low = getUvScoutInsight(summarize([hour(0, 2)], 0, 1800), 'UTC');
  const briefElevated = getUvScoutInsight(summarize([hour(0, 3)], 0, 1800), 'UTC');
  const elevatedSunscreen = briefElevated.practicalGuidance
    .find(({ title }) => title === 'Sunscreen');

  assert.equal(low.practicalGuidance.length, 0);
  assert.equal(low.contextNotes.length, 0);
  assert.match(low.takeaway, /stays below 3 throughout/i);
  assert.match(low.takeaway, /no extra sun protection/i);
  assert.match(trendLines(low)[0], /UV stays at 2\.0/);
  assert.match(trendLines(low)[0], /average is also 2\.0/);
  assert.deepEqual(timingLines(low), []);
  assert.match(elevatedSunscreen.text, /SPF 30\+/i);
  assert.equal(briefElevated.practicalGuidance.some(({ title }) => title === 'Reapply sunscreen'), true);
});

test('protection rules use raw UV 3 and 8 boundaries', () => {
  const adviceAt = (uv) => getUvScoutInsight(summarize([hour(0, uv)], 0, 3600), 'UTC');

  assert.match(adviceAt(2.9).takeaway, /no extra sun protection/i);
  assert.equal(adviceAt(3).practicalGuidance.some(({ title }) => title === 'Sunscreen'), true);
  assert.equal(adviceAt(7.9).practicalGuidance.some(({ title }) => title === 'Strongest hours'), false);
  assert.equal(adviceAt(8).practicalGuidance.some(({ title }) => title === 'Strongest hours'), true);
});

test('rounded categories explain only cross-threshold protection differences', () => {
  const adviceAt = (uv) => getUvScoutInsight(summarize([hour(0, uv)], 0, 3600), 'UTC');

  assert.equal(adviceAt(2.4).categoryNote, null);
  assert.match(adviceAt(2.9).categoryNote, /covered forecast hours stay below UV 3/i);
  assert.match(adviceAt(2.9).takeaway, /no extra sun protection/i);
  assert.equal(adviceAt(3).categoryNote, null);
  assert.match(adviceAt(7.9).categoryNote, /unrounded UV value of 8/i);
  assert.equal(adviceAt(7.9).practicalGuidance.some(({ title }) => title === 'Strongest hours'), false);
  assert.equal(adviceAt(8).categoryNote, null);
});

test('a brief UV 8 window does not describe a mostly low-UV outing as all high UV', () => {
  const result = getUvScoutInsight(summarize([
    hour(0, 8), hour(3600, 0), hour(7200, 0), hour(10800, 0), hour(14400, 0),
  ], 2700, 18000), 'UTC');

  assert.match(result.takeawayBullets[1], /around 12:30 AM to around 1:00 AM.*limit direct sun/i);
  assert.match(result.takeawayBullets[0], /average 0\.5/i);
  assert.equal(result.practicalGuidance.some(({ title }) => title === 'Strongest hours'), true);
  assert.equal(result.practicalGuidance.some(({ title }) => title === 'Lower UV hours'), false);
  assert.match(result.breakdown[2], /Lowest UV is 0\.0 for about 4 hours/i);
  assert.match(result.breakdown[2], /1:00 AM-5:00 AM/i);
  assert.match(result.takeawayBullets[1], /no extra sun protection/i);
  assert.equal(result.practicalGuidance.some(({ title }) => title === 'Sunscreen'), true);
  assert.doesNotMatch(result.takeaway, /5 hours at UV 8\+/i);
  assert.match(actionText(result, 'Clothing and shade'), /UV reaches 3 or higher for about 15 minutes/);
  assert.match(actionText(result, 'Strongest hours'), /UV reaches 8 or higher for about 15 minutes/);
  assert.match(timingLines(result)[1], /12:45 AM-1:00 AM/);
  assert.equal(result.practicalGuidance.some(({ title }) => title === 'Clothing and shade'), true);
  assert.equal(result.practicalGuidance.some(({ title }) => title === 'Strongest hours'), true);
});

test('missing later forecast never turns a known UV 3+ period into a low-UV result', () => {
  const result = getUvScoutInsight(summarize([hour(0, 4)], 0, 10800), 'UTC');

  assert.match(result.coverageMessage, /1 hour of the planned 3 hours/i);
  assert.match(result.takeaway, /1 hour/i);
  assert.match(trendLines(result)[0], /1 hour with forecast data/);
  assert.equal(result.practicalGuidance.some(({ title }) => title === 'Sunscreen'), true);
  assert.doesNotMatch(result.takeaway, /stays below 3/i);
});

test('low UV with incomplete coverage limits its recommendation to known hours', () => {
  const result = getUvScoutInsight(summarize([hour(0, 1)], 0, 7200), 'UTC');

  assert.equal(result.practicalGuidance.length, 0);
  assert.match(result.takeaway, /1 hour with forecast data/i);
  assert.doesNotMatch(result.takeaway, /throughout/i);
  assert.match(result.coverageMessage, /remaining time has no forecast/i);
  assert.match(trendLines(result)[0], /1 hour with forecast data/);
});

test('separated elevated periods stay distinct and long timing lists stay brief', () => {
  const separated = getUvScoutInsight(summarize([
    hour(0, 4), hour(3600, 1), hour(7200, 4), hour(10800, 1),
    hour(14400, 4), hour(18000, 1), hour(21600, 4),
  ], 0, 25200), 'UTC');
  const protection = separated.practicalGuidance.find(({ title }) => title === 'Clothing and shade');
  const sunscreen = separated.practicalGuidance.find(({ title }) => title === 'Sunscreen');

  assert.match(separated.takeawayBullets[1], /around 12:00 AM to around 1:00 AM.*around 2:00 AM to around 3:00 AM.*around 4:00 AM to around 5:00 AM.*around 6:00 AM to around 7:00 AM/i);
  assert.equal((separated.takeawayBullets[1].match(/cover exposed skin/g) ?? []).length, 1);
  assert.equal((separated.takeawayBullets[1].match(/no extra sun protection/g) ?? []).length, 1);
  assert.match(protection.text, /4 separate stretches, totaling about 4 hours/);
  assert.doesNotMatch(protection.text, /Timing:/i);
  assert.match(timingLines(separated)[0], /and 2 more periods/i);
  assert.match(sunscreen.text, /SPF 30\+/i);
  assert.match(separated.practicalGuidance.find(({ title }) => title === 'Reapply sunscreen').text,
    /reapply at least every two hours/i);
  assert.doesNotMatch(sunscreen.text, /continuous|extended elevated/i);
});
