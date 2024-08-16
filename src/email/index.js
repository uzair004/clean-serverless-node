const { makeSendSESEmail } = require('./awsSES');

const sendEmail = makeSendSESEmail();

module.exports = { sendEmail };