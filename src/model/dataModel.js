'use strict';

const AllDM = {};
const Prefix = {};
const BaseDM = {
  PK: 'PK',
  SK: 'SK',
  type: 'type',
  version: 'version',
  createTs: 'createTs',
  lastAlterTs: 'lastAlterTs',
  expiryTs: 'expiryTs',
  status: 'status',
  statusReason: 'statusReason',
};

const BaseGSI1DM = {
  PK1: 'PK1',
  SK1: 'SK1',
};

const UserDM = {
  ...BaseDM,
  ...BaseGSI1DM,
  userId: 'userId',

  makeType: () => 'USER',
  makePK: (userId) => `U#${userId}`,
  makeSK: (createdAt) => `D#${createdAt}`,
  splitPK: (_PK) => _PK.split('#')[1],
  splitSK: (_SK) => _SK.split('#')[1],
  makePK1: (userId) => `U#${userId}`,
  makeSK1: (regId) => `R#${regId}`,
  splitPK1: (_PK1) => _PK1.split('#')[1],
  splitSK1: (_SK1) => _SK1.split('#')[1],
};
AllDM[UserDM.makeType()] = UserDM;
Prefix[UserDM.makeType()] = 'U';

module.exports = {
  AllDM,
  UserDM,
};
