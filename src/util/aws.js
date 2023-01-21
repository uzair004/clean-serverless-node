const AWS = require('aws-sdk');

const createSignedPostURL = ({ key }) => {
  return new Promise(function (resolve, reject) {
    const S3 = new AWS.S3({ signatureVersion: 'v4' });

    S3.createPresignedPost(
      {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Expires: +process.env.PRE_SIGN_EXPIRY_TIME * 60,
        Fields: {
          Key: key,
        },
        Conditions: [
          ['content-length-range'].concat([0, process.env.MAX_SIZE_LENGTH]),
        ],
      },
      function (err, data) {
        if (err) reject(err);
        else resolve(data);
      }
    );
  });
};

const getSignedUrl = ({ key }) => {
  const s3 = new AWS.S3({
    signatureVersion: 'v4',
  });
  return s3.getSignedUrl('getObject', {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Expires: +process.env.PRE_SIGN_EXPIRY_TIME * 60,
  });
};

const uploadToS3 = async ({ key, body }) => {
  const s3 = new AWS.S3({
    signatureVersion: 'v4',
  });
  return s3
    .putObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: body,
    })
    .promise();
};

const getS3Object = async ({ key }) => {
  const s3 = new AWS.S3({
    signatureVersion: 'v4',
  });
  return s3
    .getObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    })
    .promise();
};

module.exports = {
  createSignedPostURL,
  getSignedUrl,
  uploadToS3,
  getS3Object,
};
