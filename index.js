'use strict';

const authentication = require('./authentication');
const { addAgentKey } = require('./middleware');
const checkSecurityHeaders = require('./creates/check_security_headers');
const requestPentest = require('./creates/request_pentest');
const findPentestProviders = require('./searches/find_pentest_providers');

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  flags: { cleanInputData: false },

  authentication,
  beforeRequest: [addAgentKey],

  creates: {
    [checkSecurityHeaders.key]: checkSecurityHeaders,
    [requestPentest.key]: requestPentest,
  },
  searches: {
    [findPentestProviders.key]: findPentestProviders,
  },
};
