'use strict';

const { UserDM } = require('../../model/dataModel');

function buildMakeUser({ makeTs }) {
  return function makeUser({
    userId,
    version,
    createTs = makeTs(),
    type = UserDM.makeType(),
    lastAlterTs = makeTs(),
    status = '1',
    statusReason = 'active',
  } = {}) {
    validateInputData();

    return Object.freeze({
      getId: () => userId,
      getType: () => type,
      getStatus: () => status,
      getStatusReason: () => statusReason,
      getCreateTs: () => createTs,
      getLastAlterTs: () => lastAlterTs,
      getVersion: () => version,
      hasRequiredAtts: function () {
        if (!type || !createTs || !userId || !version || !lastAlterTs) {
          return false;
        }
        return true;
      },
      getItem: function () {
        if (!this.hasRequiredAtts()) {
          return undefined;
        }
        return {
          type: this.getType(),
          createTs: this.getCreateTs(),
          userId: this.getId(),
          version: this.getVersion(),
          status: this.getStatus(),
          lastLaterTs: this.getLastAlterTs(),
          statusReason: this.getStatusReason(),
        };
      },

      deactivate: function () {
        statusReason = 'inactive';
        status = '0';
      },
    });

    function validateInputData() {}
  };
}

module.exports = { buildMakeUser };
