const AWS = require('aws-sdk');
const { makeUserDb } = require('./userDb');

const { makeDb } = require('./dynamoDb');

const region = process.env.AWS_ACCOUNT_REGION || 'us-east-1';
const tableName = process.env.DYNAMODB_MAIN_TABLE || 'main-db-table';
const IS_OFFLINE = process.env.IS_OFFLINE;

let dynamoDb;
function makeDbConnect(isOffline = true) {
  if (dynamoDb) {
    //} && dynamoDb.config.region === region) {
    return dynamoDb;
  }
  if (
    isOffline === true && // Used as over-ride
    (IS_OFFLINE === 'true' || IS_OFFLINE === undefined || isOffline === true)
  ) {
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
// Alternative solution:
// const db = makeDb({ makeDbConnect })
// const requestDb = makeRequestDb({ db, getTableName })
// const userDb = makeUserDb({ db, getTableName })

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
