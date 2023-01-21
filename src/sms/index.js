const { makeSendPk } = require('./sendpk');
const { makeMessageBody } = require('./messageBody');
const { makeTs } = require('./../util/util');
const responses = require('./../../responses.json');

const sendPk = makeSendPk({ responses });
const messageBody = makeMessageBody({ responses, makeTs });
const smsUtility = Object.freeze({ sendPk, messageBody });

module.exports = { smsUtility, sendPk, messageBody };
