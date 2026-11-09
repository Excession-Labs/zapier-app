'use strict';

/* Live calls to the public services, except the success path of the request action.
   That path uses a recorded answer so a normal test run creates no request.
   Set LIVE_REQUEST=1 to send one real request with an @example.com email (stored as test data). */

const zapier = require('zapier-platform-core');
const nock = require('nock');
const App = require('../index');

const appTester = zapier.createAppTester(App);
const PTS = 'https://penetrationtestservices.com';

let key = '';

const register = async () => {
  const res = await fetch(`${PTS}/agent/auth`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ agent_name: 'excession-zapier-app-test' }),
  });
  if (res.status !== 201) throw new Error(`Key registration failed with status ${res.status}`);
  return (await res.json()).access_token;
};

const revoke = async (k) => {
  await fetch(`${PTS}/agent/auth`, { method: 'DELETE', headers: { Authorization: `Bearer ${k}` } });
};

beforeAll(async () => {
  key = await register();
});

afterAll(async () => {
  if (key) await revoke(key);
});

const request = (over = {}) => ({
  name: 'Test Person',
  email: 'zapier-app-test@example.com',
  test_type: 'web_app',
  targets: ['https://example.com'],
  person_consent: true,
  authorized: true,
  ...over,
});

describe('authentication', () => {
  it('accepts an empty key', async () => {
    const out = await appTester(App.authentication.test, { authData: { api_key: '' } });
    expect(out.connected).toMatch(/without a key/);
  });

  it('accepts a live agent key', async () => {
    const out = await appTester(App.authentication.test, { authData: { api_key: key } });
    expect(out.connected).toBe('with an agent key');
  });

  it('rejects a wrong key', async () => {
    await expect(
      appTester(App.authentication.test, { authData: { api_key: 'exl_agent_' + '0'.repeat(48) } }),
    ).rejects.toThrow(/not accepted/);
  });
});

describe('Check Security Headers', () => {
  it('returns the live result for example.com', async () => {
    const out = await appTester(App.creates.check_security_headers.operation.perform, {
      inputData: { url: 'https://example.com' },
      authData: {},
    });
    expect(out.final_url).toMatch(/^https:\/\/example\.com/);
    expect(out.http_status).toBe(200);
    expect(out.pass + out.warn + out.fail + out.info).toBe(out.checks.length);
    expect(out.checks.find((c) => c.id === 'hsts')).toBeTruthy();
    expect(typeof out.checked_at).toBe('string');
  });
});

describe('Find Pentest Providers', () => {
  const run = (inputData) =>
    appTester(App.searches.find_pentest_providers.operation.perform, { inputData, authData: {} });

  it('returns rows with the check date', async () => {
    const rows = await run({ limit: 5 });
    expect(rows).toHaveLength(5);
    for (const r of rows) {
      expect(r.checked_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(r.last_checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('filters by delivery', async () => {
    const rows = await run({ delivery: 'automated', limit: 100 });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.delivery === 'automated')).toBe(true);
  });

  it('filters by scope', async () => {
    const rows = await run({ scope: 'ai_apps', limit: 100 });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.ai_apps === 'yes')).toBe(true);
  });

  it('keeps only published prices', async () => {
    const rows = await run({ published_price_only: true, limit: 100 });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.has_published_price && r.first_price_amount)).toBe(true);
  });

  it('marks the publisher row', async () => {
    const rows = await run({ limit: 100 });
    const own = rows.filter((r) => r.publisher_owned);
    expect(own).toHaveLength(1);
    expect(own[0].slug).toBe('excession-labs');
    expect(own[0].publisher_note).toMatch(/owns this row/);
    expect(rows.filter((r) => !r.publisher_owned).every((r) => r.publisher_note === '')).toBe(true);
  });
});

describe('Request a Penetration Test', () => {
  const perform = (inputData, authData = { api_key: key }) =>
    appTester(App.creates.request_pentest.operation.perform, { inputData, authData });

  it('stops when person_consent is not true', async () => {
    await expect(perform(request({ person_consent: false }))).rejects.toThrow(/person_consent|Person asked/);
  });

  it('stops when authorized is not true', async () => {
    await expect(perform(request({ authorized: 'no' }))).rejects.toThrow(/allowed to arrange/);
  });

  it('stops without a key', async () => {
    await expect(perform(request(), { api_key: '' })).rejects.toThrow(/needs an agent key/);
  });

  it('shows the server field errors (live, creates nothing)', async () => {
    await expect(perform(request({ email: 'not-an-email' }))).rejects.toThrow(/valid email/);
  });

  it('sends the body and reads the 201 answer (recorded)', async () => {
    let seen;
    const scope = nock(PTS)
      .post('/api/agent/request', (b) => {
        seen = b;
        return true;
      })
      .matchHeader('authorization', `Bearer ${key}`)
      .reply(201, { ok: true, reference: 'recorded-ref', next_steps: 'Excession Labs will reply by email.' });
    const out = await perform(request({ targets: ['https://example.com', 'https://api.example.com'], notes: 'Test.' }));
    expect(scope.isDone()).toBe(true);
    expect(seen.person_consent).toBe(true);
    expect(seen.authorized).toBe(true);
    expect(seen.targets).toHaveLength(2);
    expect(out.reference).toBe('recorded-ref');
    nock.cleanAll();
  });

  (process.env.LIVE_REQUEST ? it : it.skip)('creates one live test request', async () => {
    const out = await perform(request({ name: 'Zapier App Test (test data)', notes: 'Automated test of the Zapier app. Test data.' }));
    expect(out.reference).toBeTruthy();
  });
});
