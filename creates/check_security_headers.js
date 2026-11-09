'use strict';

const { PTS } = require('../lib/constants');

const perform = async (z, bundle) => {
  const response = await z.request({
    url: `${PTS}/api/check-headers`,
    params: { url: bundle.inputData.url },
    skipThrowForStatus: true,
  });
  if (response.status === 429) {
    throw new z.errors.ThrottledError(
      'The header checker allows 12 checks per minute per IP address. Try again soon.',
      60,
    );
  }
  const data = response.data || {};
  if (response.status >= 400 || data.ok === false) {
    throw new z.errors.Error(
      data.error || `The header check failed with status ${response.status}.`,
      'CheckFailed',
      response.status,
    );
  }
  const checks = Array.isArray(data.checks) ? data.checks : [];
  const summary = data.summary || {};
  const line = (c) => `${c.name}${c.value ? ` (${c.value})` : ''}`;
  return {
    id: `${data.final_url || bundle.inputData.url}@${data.checked_at || ''}`,
    checked_url: data.checked_url,
    final_url: data.final_url,
    http_status: data.status,
    checked_at: data.checked_at,
    pass: summary.pass,
    warn: summary.warn,
    fail: summary.fail,
    info: summary.info,
    failed_checks: checks.filter((c) => c.status === 'fail').map(line).join(', '),
    warning_checks: checks.filter((c) => c.status === 'warn').map(line).join(', '),
    checks: checks.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      value: c.value,
      note: c.note,
    })),
  };
};

module.exports = {
  key: 'check_security_headers',
  noun: 'Security header check',
  display: {
    label: 'Check Security Headers',
    description:
      'Reads the HTTP security headers of a public web page and returns a pass, warn or fail result for each. No key needed.',
  },
  operation: {
    inputFields: [
      {
        key: 'url',
        label: 'URL',
        type: 'string',
        required: true,
        helpText:
          'The public page to check, for example the home page of your own site. Check only sites you own or may test. The service allows 12 checks per minute per IP address.',
      },
    ],
    perform,
    sample: {
      id: 'https://example.com/@2026-11-09T18:29:25.425Z',
      checked_url: 'https://example.com/',
      final_url: 'https://example.com/',
      http_status: 200,
      checked_at: '2026-11-09T18:29:25.425Z',
      pass: 2,
      warn: 2,
      fail: 4,
      info: 1,
      failed_checks: 'Strict-Transport-Security, Content-Security-Policy',
      warning_checks: 'Referrer-Policy',
      checks: [
        {
          id: 'https',
          name: 'HTTPS',
          status: 'pass',
          value: 'https',
          note: 'The page is served over https.',
        },
      ],
    },
    outputFields: [
      { key: 'id', label: 'Check ID' },
      { key: 'checked_url', label: 'Checked URL' },
      { key: 'final_url', label: 'Final URL after redirects' },
      { key: 'http_status', label: 'HTTP status', type: 'integer' },
      { key: 'checked_at', label: 'Checked at' },
      { key: 'pass', label: 'Checks passed', type: 'integer' },
      { key: 'warn', label: 'Checks with a warning', type: 'integer' },
      { key: 'fail', label: 'Checks failed', type: 'integer' },
      { key: 'info', label: 'Informational checks', type: 'integer' },
      { key: 'failed_checks', label: 'Failed checks (names)' },
      { key: 'warning_checks', label: 'Warning checks (names)' },
    ],
  },
};
