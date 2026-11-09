'use strict';

const { PTS } = require('./lib/constants');

// The key is optional. "Check Security Headers" and "Find Pentest Providers" need no key.
// "Request a Penetration Test" needs the agent key.
// The test call sends an empty body to the request endpoint. The server checks the key first
// and answers 401 for a bad key and 422 (fields missing) for a good key. It stores nothing.
const test = async (z, bundle) => {
  const key = (bundle.authData.api_key || '').trim();
  if (!key) {
    return { connected: 'without a key (headers and provider search only)' };
  }
  const response = await z.request({
    url: `${PTS}/api/agent/request`,
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: {},
    skipThrowForStatus: true,
  });
  if (response.status === 401) {
    throw new z.errors.Error(
      `The agent key was not accepted. Register a new key with POST ${PTS}/agent/auth.`,
      'AuthenticationError',
      401,
    );
  }
  if (response.status === 422 || response.status === 201) {
    return { connected: 'with an agent key' };
  }
  throw new z.errors.Error(
    `Unexpected answer ${response.status} while checking the agent key.`,
    'AuthenticationError',
    response.status,
  );
};

module.exports = {
  type: 'custom',
  fields: [
    {
      key: 'api_key',
      label: 'Agent key',
      type: 'password',
      required: false,
      helpText:
        'Needed only for the action "Request a Penetration Test". Register a free key at ' +
        `${PTS}/agent/auth (send a POST request with {"agent_name": "your name"}). ` +
        'The key starts with exl_agent_. Leave this empty to use "Check Security Headers" and "Find Pentest Providers" only.',
    },
  ],
  test,
  connectionLabel: '{{bundle.inputData.connected}}',
};
