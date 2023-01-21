const jwt = require('jsonwebtoken');
const { makeTs } = require('../util/util');

const { makeJWT, makeVerifyToken, makeDecodeToken } = require('./jwt');
const { makeCreateSecret } = require('./secretGenerator');
const { makeValidateTokenContent } = require('./validateToken');

const createToken = makeJWT({ jwt });
const verifyToken = makeVerifyToken({ jwt });
const decodeToken = makeDecodeToken({ jwt });
const createSecret = makeCreateSecret();
const validateTokenContent = makeValidateTokenContent({ makeTs });

module.exports = {
  createToken,
  verifyToken,
  createSecret,
  validateTokenContent,
  decodeToken,
};
