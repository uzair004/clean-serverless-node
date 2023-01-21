'use strict';

const { verifyToken, decodeToken } = require('../token');

const { getAuthorizationToken } = require('../util/util');

const { makeJWTAuth } = require('./jwtAuth');

const jwtAuth = makeJWTAuth({
  verifyToken,
  getAuthorizationToken,
  decodeToken,
});

module.exports = { jwtAuth };
