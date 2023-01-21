'use strict';

const AllDM = {};
const Prefix = {};
const BaseDM = {
  PK: 'PK',
  SK: 'SK',
  type: 'type',
  version: 'version',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
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
  profileImage: 'profileImage',
  fullName: 'fullName',
  email: 'email',
  password: 'password',

  makeType: () => 'USER',
  makePK: (userId) => `U#${userId}`,
  makeSK: () => `A`,
  splitPK: (_PK) => ({ userId: _PK.split('#')[1] }),
  splitSK: () => undefined,
};
AllDM[UserDM.makeType()] = UserDM;
Prefix[UserDM.makeType()] = 'U';

module.exports = {
  AllDM,
  UserDM,
};
