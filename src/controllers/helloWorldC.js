'use strict';

function makeHelloWorldC({ helloWorldUC, getApiInfo, getRemoteIp }) {
  return async function helloWorldC(event) {
    try {
      const apiInfo = getApiInfo(event);
      const remoteIp = getRemoteIp(event);
      const result = await helloWorldUC({ apiInfo, remoteIp });
      return createResponse(result);
    } catch (err) {
      console.error(err);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': '*',
          Accept: '*',
        },
        body: JSON.stringify({
          message: 'Internal Server Error',
          nerdInfo: err,
        }),
      };
    }
  };
}

const createResponse = (response) => {
  return {
    statusCode: response.statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*',
      Accept: '*',
    },
    body: JSON.stringify(response.body),
  };
};

module.exports = {
  makeHelloWorldC,
};
