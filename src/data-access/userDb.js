'use strict';

const { makeTs, head } = require('../util/util');

const { UserDM } = require('../model/dataModel');

function makeUserDb({ makeDb, makeDbConnect, getTableName }) {
  return Object.freeze({
    getUserByEmail,
    updateUser,
    updateProfile,
    createUser,
    getUser,
  });

  async function createUser({ userId, email, ...itemInput }) {
    const db = makeDb({ makeDbConnect, getTableName });

    const requestInfo = {
      ...itemInput,
      ...{
        createdAt: makeTs(),
        updatedAt: makeTs(),
      },
    };

    const itemInfo = {
      PK: UserDM.makePK(userId),
      SK: UserDM.makeSK(),
      PK1: UserDM.makePK1(email),
      SK1: UserDM.makeSK1(),
      ...requestInfo,
    };

    await db.putItem({ itemInfo });
  }

  async function updateUser({ userId, email, ...itemInput }) {
    const db = makeDb({ makeDbConnect, getTableName });

    const requestInfo = {
      ...itemInput,
      email,
      ...{ updatedAt: makeTs() },
    };

    const itemInfo = {
      PK: UserDM.makePK(userId),
      SK: UserDM.makeSK(),
      PK1: UserDM.makePK1(email),
      SK1: UserDM.makeSK1(),
      ...requestInfo,
    };

    await db.updateItem({ itemInfo });
  }

  async function getUser({ userId }) {
    const db = makeDb({ makeDbConnect, getTableName });

    const itemInfo = {
      PK: UserDM.makePK(userId),
      SK: UserDM.makeSK(),
    };

    const result = await db.getItem({ itemInfo });

    return result;
  }

  async function updateProfile({ userId, ...itemInput }) {
    const db = makeDb({ makeDbConnect, getTableName });

    const requestInfo = {
      ...itemInput,
      ...{
        updatedAt: makeTs(),
      },
    };

    const itemInfo = {
      PK: UserDM.makePK(userId),
      SK: UserDM.makeSK(requestInfo.createdAt),
      ...requestInfo,
    };

    const result = await db.updateItem({ itemInfo });

    return result;
  }

  async function getUserByEmail({ email }) {
    const db = makeDb({ makeDbConnect, getTableName });

    const itemInfo = {
      PK1: UserDM.makePK1(email),
      SK1: UserDM.makeSK1(),
    };

    const result = await db.queryGSI({ itemInfo, limit: 1, operator: '=' });

    return head(result);
  }
}

module.exports = {
  makeUserDb,
};
