const makeJWT = ({ jwt }) => {
  return function jwtTokenGenerator({ payload, secretKey }) {
    return jwt.sign(payload, secretKey);
  };
};

const makeVerifyToken = ({ jwt }) => {
  return function verifyToken({ token, secretKey }) {
    try {
      jwt.verify(token, secretKey);
    } catch (e) {
      console.error(e);
      throw new Error('Could Not Verify Authenticity of the token');
    }
  };
};

const makeDecodeToken = ({ jwt }) => {
  return function decodeToken({ token }) {
    return jwt.decode(token);
  };
};

module.exports = { makeJWT, makeVerifyToken, makeDecodeToken };
