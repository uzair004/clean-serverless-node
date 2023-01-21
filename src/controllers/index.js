'use strict';

const {
  getApiInfo,
  getRemoteIp,
  isValidEmail,
  missingItem,
} = require('../util/util');

const { helloWorldUC } = require('../use-cases');
const { makeHelloWorldC } = require('./helloWorldC');

const helloWorldC = makeHelloWorldC({
  helloWorldUC,
  getApiInfo,
  getRemoteIp,
  isValidEmail,
  missingItem,
});

const requestController = Object.freeze({
  helloWorldC,
});

module.exports = { helloWorldC, requestController };
