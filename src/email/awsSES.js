'use strict';

// importing AWS sdk
const AWS = require('aws-sdk');

// The function to send SES email message
const makeSendSESEmail = () => {
  return async ({
    toEmailAddresses,
    bodyData,
    htmlData,
    subjectData,
    sourceEmail,
    replyToAddresses,
    bodyCharset = 'UTF-8',
    subjectCharset = 'UTF-8',
  }) => {
    try {
      const ses = new AWS.SES();
      const emailParams = {
        Destination: {
          ToAddresses: toEmailAddresses,
        },
        Message: {
          Body: {
            Text: {
              Data: bodyData,
              Charset: bodyCharset,
            },
            Html: {
              Data: htmlData,
              Charset: bodyCharset,
            },
          },
          Subject: {
            Data: subjectData,
            Charset: subjectCharset,
          },
        },
        Source: sourceEmail,
        ReplyToAddresses: replyToAddresses,
      };

      await ses.sendEmail(emailParams).promise();
    } catch (err) {
      console.error(err);
    }
  };
};

module.exports = { makeSendSESEmail };
