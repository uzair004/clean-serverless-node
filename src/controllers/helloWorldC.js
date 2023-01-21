'use strict';
const { createSuccessResponseHeaders } = require('../util/util');

function makeHelloWorldC({
  helloWorldUC,
  getApiInfo,
  getRemoteIp,
  // missingItem,
  // isValidEmail,
}) {
  return async function helloWorldC(event) {
    try {
      const apiInfo = getApiInfo(event);
      const remoteIp = getRemoteIp(event);

      // const { body } = event;

      // if (!body) {
      //   return createResponse(missingItem('Body'));
      // }

      // const { data } = JSON.parse(body);

      // if (!data) {
      //   return createResponse(missingItem('Data'));
      // }

      // const { email } = data;

      // if (!isValidEmail()) {
      //   return createResponse({
      //     response: {
      //       statusCode: 400,
      //       body: {
      //         message: 'Invalid CNIC',
      //       },
      //     },
      //   });
      // }

      const result = await helloWorldUC({ apiInfo, remoteIp });

      return createResponse({ response: result });
    } catch (err) {
      console.error(err);
      return createResponse({
        response: {
          statusCode: 500,
          body: { message: 'Internal Server Error' },
        },
      });
    }
  };
}

const createResponse = ({ response }) => {
  return {
    statusCode: response.statusCode,
    headers: createSuccessResponseHeaders(),
    body: JSON.stringify(response.body),
  };
};

module.exports = {
  makeHelloWorldC,
};
