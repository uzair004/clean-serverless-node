const AWS = require('aws-sdk');
const { makeUserDb } = require('./userDb');

const { isValueTrue } = require('../util/util');

const { makeDb } = require('./dynamoDb');

const region = process.env.REGION || 'us-east-1';
const tableName = process.env.DYNAMODB_MAIN_TABLE || 'main-db-table';
const IS_OFFLINE = process.env.IS_OFFLINE;

let dynamoDb;
function makeDbConnect() {
  if (dynamoDb) {
    return dynamoDb;
  }

  if (isValueTrue(IS_OFFLINE)) {
    return new AWS.DynamoDB({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
      accessKeyId: 'access_key_id',
      secretAccessKey: 'secret_access_key',
    });
  } else {
    AWS.config.update({ region });
  }
  dynamoDb = new AWS.DynamoDB({
    httpOptions: {
      connectTimeout: 1000,
      timeout: 1000,
      maxRetries: 3,
    },
  });
  return dynamoDb;
}

const userDb = makeUserDb({ makeDb, makeDbConnect, getTableName });

function getTableName() {
  return tableName;
}

module.exports = {
  makeDb,
  makeDbConnect,
  getTableName,
  userDb,
};
