const { makeSendSESEmail } = require('./awsSES');

const sendEmail = makeSendSESEmail();

module.exports = { sendEmail };

// can be imported & used in following way

// await sendEmail({
//     toEmailAddresses: ['email@email.com'],
//     subjectData: `Email Subject`,
//     sourceEmail: 'emailsender@email.com', // from env SOURCE_EMAIL
//     replyToAddresses: [REPLY_TO_ADDRESS], // from env
//     bodyData: 'email body',
//     htmlData: `an html template some with body.....`
// })