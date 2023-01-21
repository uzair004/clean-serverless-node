const { randomBytes } = require('crypto');

const makeCreateSecret = () => {
  return function createSecret() {
    return randomBytes(32).toString('base64');
  };
};

module.exports = { makeCreateSecret };
