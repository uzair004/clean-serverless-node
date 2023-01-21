const jwt = require('jsonwebtoken');
const faker = require('faker');
const { makeJWT, makeGetTokenContent } = require('./jwt');

describe('JWT Tokenization', () => {
  const createToken = makeJWT({ jwt });
  const verifyToken = makeGetTokenContent({ jwt });
  it('should create a new JWT token', () => {
    expect.assertions(2);
    const token = createToken({
      payload: {
        id: faker.random.alphaNumeric(5),
        email: faker.internet.email(),
        name: faker.name.findName(),
      },
      secretKey: faker.datatype.uuid(),
    });
    expect(token).toBeDefined();
    expect(token.split('.').length).toEqual(3);
  });

  it('Should destructure a valid token', () => {
    expect.assertions(5);
    const id = faker.random.alphaNumeric(5);
    const email = faker.internet.email();
    const name = faker.name.findName();
    const secretKey = faker.datatype.uuid();
    const token = createToken({
      payload: { id, email, name },
      secretKey,
    });
    const data = verifyToken({ token, secretKey });
    expect(data).toBeDefined();
    expect(data.id).toEqual(id);
    expect(data.email).toEqual(email);
    expect(data.name).toEqual(name);
    expect(data).toHaveProperty('iat');
  });

  it('Should not destructure an invalid token.', () => {
    expect.assertions(1);
    const token = createToken({
      payload: {
        id: faker.random.alphaNumeric(5),
        email: faker.internet.email(),
        name: faker.name.findName(),
      },
      secretKey: faker.datatype.uuid(),
    });
    try {
      expect(
        verifyToken({ token, secretKey: faker.datatype.uuid() })
      ).toThrow();
    } catch (e) {
      expect(e.message).toEqual('Could Not Verify Authenticity of the token');
    }
  });
});
