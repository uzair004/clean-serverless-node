'use strict';

function makeJWTAuth({
  decodeToken,
  verifyToken,
  getAuthorizationToken,
}) {
  return async function jwtAuth(event, context) {
    try {
      const token = getAuthorizationToken(event);
      if (!token) {
        throw 'Missing Token';
      }
      verifyToken({ token });

      const tokenContent = decodeToken({ token });
      const { id: userId } = tokenContent;

      // const { userId } = event.pathParameters;

      // if (tokenContent.id !== userId) {
      //   throw "Token Doesn't belong to the user";
      // }

      return { userId };
    } catch (err) {
      console.error(err);
      context.end();

      return {
        statusCode: 401,
        body: JSON.stringify({
          message: String(err) ?? 'Error Verifying Token',
        }),
      };
    }
  };
}
module.exports = {
  makeJWTAuth,
};
