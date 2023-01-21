'use strict';

const { makeHelloWorldUC } = require('./helloWorldUC');

const helloWorldUC = makeHelloWorldUC({});

const requestService = Object.freeze({ helloWorldUC });

module.exports = {
  requestService,
  helloWorldUC,
};
