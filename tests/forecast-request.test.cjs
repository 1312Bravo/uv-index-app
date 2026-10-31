const assert = require('node:assert/strict');
const test = require('node:test');

const { fetchForecastJson } = require('../node_modules/.cache/uv-scout-domain-tests/services/forecast/fetchForecastJson.js');
const { getHourlyForecast } = require('../node_modules/.cache/uv-scout-domain-tests/services/forecast/getHourlyForecast.js');

test('forecast requests hourly gust maxima and parses optional values without overriding them', async (t) => {
  const originalFetch = global.fetch;
  t.after(() => { global.fetch = originalFetch; });
  const nowHour = Math.floor(Date.now() / 3_600_000) * 3600;
  const times = Array.from({ length: 32 }, (_, index) => nowHour + (index - 6) * 3600);
  const gusts = times.map(() => 15);
  [0, 28, null, -4, '15', undefined].forEach((value, index) => { gusts[6 + index] = value; });
  global.fetch = async (url) => {
    assert.ok(new URL(url).searchParams.get('hourly').split(',').includes('wind_gusts_10m'));
    return { ok: true, json: async () => ({
      timezone: 'UTC',
      current: { time: nowHour, uv_index: 2, temperature_2m: 20, wind_speed_10m: 99 },
      hourly: {
        time: times, uv_index: times.map(() => 2), temperature_2m: times.map(() => 20),
        cloud_cover: times.map(() => 50), wind_gusts_10m: gusts,
      },
    }) };
  };
  const result = await getHourlyForecast(46, 14);
  assert.deepEqual(result.hours.filter(({ time }) => time >= nowHour).slice(0, 6).map(({ windGust }) => windGust),
    [0, 28, null, null, null, null]);
});

test('forecast request returns parsed JSON and clears its timeout', async (t) => {
  const originalFetch = global.fetch;
  t.after(() => { global.fetch = originalFetch; });
  const payload = { timezone: 'Europe/Ljubljana' };
  global.fetch = async (_url, options) => {
    assert.equal(options.signal.aborted, false);
    return { ok: true, json: async () => payload };
  };

  assert.deepEqual(await fetchForecastJson('https://example.test/forecast', undefined, 20), payload);
});

test('forecast request times out and aborts a stalled fetch', async (t) => {
  const originalFetch = global.fetch;
  t.after(() => { global.fetch = originalFetch; });
  let requestSignal;
  global.fetch = async (_url, options) => {
    requestSignal = options.signal;
    return new Promise(() => {});
  };

  await assert.rejects(fetchForecastJson('https://example.test/forecast', undefined, 10), /timed out/);
  assert.equal(requestSignal.aborted, true);
});

test('forecast request times out if response JSON stalls', async (t) => {
  const originalFetch = global.fetch;
  t.after(() => { global.fetch = originalFetch; });
  global.fetch = async () => ({ ok: true, json: () => new Promise(() => {}) });

  await assert.rejects(fetchForecastJson('https://example.test/forecast', undefined, 10), /timed out/);
});

test('forecast request cancels promptly when its caller aborts', async (t) => {
  const originalFetch = global.fetch;
  t.after(() => { global.fetch = originalFetch; });
  const controller = new AbortController();
  let requestSignal;
  global.fetch = async (_url, options) => {
    requestSignal = options.signal;
    return new Promise(() => {});
  };

  const request = fetchForecastJson('https://example.test/forecast', controller.signal, 1_000);
  controller.abort();
  await assert.rejects(request, /cancelled/);
  assert.equal(requestSignal.aborted, true);
});
