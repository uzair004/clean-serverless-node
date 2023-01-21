const https = require('https');

const makeSendPk = () => {
  return async ({ userPhone, messageBody }) => {
    const baseUrl = 'sendpk.com';
    const path = '/api/sms.php';
    const username = process.env.SENDPK_ACCOUNT_NUMBER;
    const password = process.env.SENDPK_ACCOUNT_PASSWORD;
    const brandName = 'Nordvisor';
    const queryParams = `username=${username}&password=${password}&sender=${brandName}&mobile=${userPhone}&message=${messageBody}`;

    try {
      const requestId = await sendMessage({ queryParams, baseUrl, path });
      console.warn({ requestId });
      if (!requestId.startsWith('OK ID:')) {
        throw new Error("Couldn't Complete");
      }
      return requestId;
    } catch (error) {
      console.error({ error });
      throw new Error(error.message);
    }
  };
};

module.exports = { makeSendPk };

async function sendMessage({ baseUrl, path, queryParams }) {
  const options = {
    hostname: baseUrl,
    path: `${path}?${encodeURI(queryParams)}`,
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      accept: '*',
    },
  };
  const response = await createRequest(options);
  return response;
}

function createRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        resolve(responseBody);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}
