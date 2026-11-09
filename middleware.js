'use strict';

const { PTS } = require('./lib/constants');

// Send the agent key to the request endpoint only. Other calls are public and carry no key.
const addAgentKey = (request, z, bundle) => {
  const key = ((bundle.authData && bundle.authData.api_key) || '').trim();
  if (key && request.url && request.url.startsWith(`${PTS}/api/agent/request`)) {
    request.headers = request.headers || {};
    request.headers.Authorization = `Bearer ${key}`;
  }
  return request;
};

module.exports = { addAgentKey };
