'use strict';

const { getApiInfo, getRemoteIp } = require('../util/util');

const { helloWorldUC } = require('../use-cases');
const { makeHelloWorldC } = require('./helloWorldC');

const helloWorldC = makeHelloWorldC({
  helloWorldUC,
  getApiInfo,
  getRemoteIp,
});

const requestController = Object.freeze({
  helloWorldC,
});

module.exports = { helloWorldC, requestController };
