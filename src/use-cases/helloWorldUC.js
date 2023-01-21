'use strict';

const makeHelloWorldUC = () => {
  return async function helloWorldUC(requestInfo) {
    return {
      statusCode: 200,
      body: requestInfo,
    };
  };
};

module.exports = { makeHelloWorldUC };
