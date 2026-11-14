const assert = require('node:assert/strict');
const { test } = require('node:test');

const domainBuild = '../node_modules/.cache/uv-scout-domain-tests';
const { getEuropeanAqiCategory } = require(`${domainBuild}/domain/airQuality/getEuropeanAqiCategory.js`);
const { summarizeOutingAirQuality } = require(`${domainBuild}/domain/airQuality/summarizeOutingAirQuality.js`);
const { getOutingAirQualityDescription } = require(`${domainBuild}/domain/airQuality/getOutingAirQualityDescription.js`);
const { getCurrentAirQuality } = require(`${domainBuild}/services/airQuality/getCurrentAirQuality.js`);
const { getHourlyAirQualityForecast } = require(`${domainBuild}/services/airQuality/getHourlyAirQualityForecast.js`);

test('European AQI assigns shared boundaries to the intended category', () => {
  for (const [value, category] of [
    [0, 'good'], [19.9, 'good'], [20, 'fair'], [40, 'moderate'],
    [60, 'poor'], [80, 'very-poor'], [100, 'very-poor'], [100.1, 'extremely-poor'],
  ]) {
    assert.equal(getEuropeanAqiCategory(value).key, category);
  }
});

test('outing AQI weights partial hours and reports missing coverage', () => {
  const hours = [
    { time: 0, europeanAqi: 20 },
    { time: 3600, europeanAqi: 60 },
    { time: 7200, europeanAqi: null },
  ];
  const summary = summarizeOutingAirQuality(hours, new Date(1800 * 1000), new Date(10800 * 1000));
  assert.equal(summary.lowestAqi, 20);
  assert.equal(summary.peakAqi, 60);
  assert.equal(summary.averageAqi, 60 * 2 / 3 + 20 / 3);
  assert.equal(summary.coverageFraction, 0.6);
});

test('outing description distinguishes a steady category from a higher peak', () => {
  const fair = getEuropeanAqiCategory(30);
  const moderate = getEuropeanAqiCategory(45);
  const steady = getOutingAirQualityDescription(
    { lowestAqi: 25, peakAqi: 34, averageAqi: 29.7, coverageFraction: 1 }, fair, fair,
  );
  assert.match(steady.takeaway, /ranges from 25 to 34 \(average 29\.7\), staying Fair/);
  assert.equal(steady.generalAdvice, steady.sensitiveAdvice);

  const changing = getOutingAirQualityDescription(
    { lowestAqi: 25, peakAqi: 45, averageAqi: 35, coverageFraction: 1 }, fair, moderate,
  );
  assert.match(changing.takeaway, /reaching Moderate at its peak/);
  assert.equal(changing.generalAdvice, fair.generalAdvice);
  assert.match(changing.sensitiveAdvice, /^At the peak, consider reducing intense outdoor activity/);
});

test('air-quality requests keep the returned grid point separate from requested coordinates', async (t) => {
  const originalFetch = global.fetch;
  t.after(() => { global.fetch = originalFetch; });
  const requestUrls = [];
  global.fetch = async (url) => {
    requestUrls.push(new URL(url));
    return { ok: true, json: async () => ({
      latitude: 46.1,
      longitude: 14.6,
      timezone: 'Europe/Ljubljana',
      current: { time: 3600, european_aqi: 29.7 },
      hourly: { time: [0, 3600], european_aqi: [25, null] },
    }) };
  };

  const requested = { latitude: 46, longitude: 14.5 };
  const current = await getCurrentAirQuality(requested);
  const hourly = await getHourlyAirQualityForecast(requested);
  assert.deepEqual(current.forecastPoint, { latitude: 46.1, longitude: 14.6 });
  assert.deepEqual(hourly.forecastPoint, current.forecastPoint);
  assert.deepEqual(hourly.hours, [
    { time: 0, europeanAqi: 25 }, { time: 3600, europeanAqi: null },
  ]);
  assert.equal(requestUrls[0].searchParams.get('current'), 'european_aqi');
  assert.equal(requestUrls[1].searchParams.get('hourly'), 'european_aqi');
  assert.equal(requestUrls[1].searchParams.get('forecast_days'), '2');
});
