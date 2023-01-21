const { makeAwsTexract } = require('./awsTextract');

const ocrPhotoId = makeAwsTexract({ featuresTypes: ['TABLES', 'FORMS'] });

module.exports = { ocrPhotoId };
