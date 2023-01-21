'use strict';

const { buildMakeUser } = require('./user');

const { makeTs } = require('../../util/util');

const makeUser = buildMakeUser({
  makeTs,
});

module.exports = {
  makeUser,
};
