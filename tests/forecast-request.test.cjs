const assert = require('node:assert/strict');
const test = require('node:test');

const { fetchForecastJson } = require('../node_modules/.cache/uv-scout-domain-tests/services/forecast/fetchForecastJson.js');

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
