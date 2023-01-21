const { makeTs } = require('../util/util');
const faker = require('faker');
const { makeValidateTokenContent } = require('./validateToken');

describe('Validate Token', () => {
  const validateTokenContent = makeValidateTokenContent({ makeTs });

  it('successfully validate the token', () => {
    expect.assertions(1);
    const id = faker.random.alphaNumeric(5);
    const email = faker.internet.email();
    const name = faker.name.findName();

    const tokenContent = {
      id,
      email,
      name,
      createTs: makeTs(),
      expiryTs: faker.date.future().toISOString(),
    };
    expect(validateTokenContent({ tokenContent, id })).toBeUndefined(); // the response being undefined means that it did not return any error
  });

  it('successfully invalidate the token (mismatchingID)', () => {
    expect.assertions(1);
    const id = faker.random.alphaNumeric(5);
    const email = faker.internet.email();
    const name = faker.name.findName();

    const tokenContent = {
      id,
      email,
      name,
      createTs: makeTs(),
      expiryTs: faker.date.future().toISOString(),
    };
    try {
      validateTokenContent({ tokenContent, id: faker.random.alphaNumeric(5) });
    } catch (e) {
      expect(e.message).toBe('Invalid Token');
    }
  });

  it('successfully invalidate the token (wrong CreateTs)', () => {
    expect.assertions(1);
    const id = faker.random.alphaNumeric(5);
    const email = faker.internet.email();
    const name = faker.name.findName();

    const tokenContent = {
      id,
      email,
      name,
      createTs: faker.date.future().toISOString(),
      expiryTs: faker.date.future().toISOString(),
    };
    try {
      validateTokenContent({ tokenContent });
    } catch (e) {
      expect(e.message).toBe('Invalid Token');
    }
  });

  it('successfully invalidate the token (wrong ExpiryTs)', () => {
    expect.assertions(1);
    const id = faker.random.alphaNumeric(5);
    const email = faker.internet.email();
    const name = faker.name.findName();

    const tokenContent = {
      id,
      email,
      name,
      createTs: makeTs(),
      expiryTs: faker.date.past().toISOString(),
    };
    try {
      validateTokenContent({ tokenContent });
    } catch (e) {
      expect(e.message).toBe('Invalid Token');
    }
  });
});
