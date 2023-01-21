const jwt = require('jsonwebtoken');
const { makeCreateSecret } = require('./secretGenerator');

describe('Secret Generator', () => {
  const createSecret = makeCreateSecret({ jwt });
  it('should create a 256 bit (32 bytes) token', () => {
    const secret = createSecret();
    expect(Buffer(secret, 'base64').length).toEqual(32);
  });
});
