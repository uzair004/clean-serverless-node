'use strict';
const { randomBytes } = require('crypto');

function getApiInfo(event) {
  let splitPath;
  if (event.path) {
    splitPath = event.path.split('/'); // for rest APIs
  } else {
    splitPath = event.rawPath.split('/'); // for http APIs
  }
  const apiInfo = {
    apiCategory: splitPath[1],
    apiVersion: splitPath[2],
    apiName: splitPath[3],
  };
  return apiInfo;
}

//  Todo:
//  1.  Detect type of API (HTTP-API or REST) and process accordingly.
function getRemoteIp(event) {
  if (event.headers['X-Forwarded-For']) {
    return event.headers['X-Forwarded-For'].split(', ')[0];
  } else {
    return event.headers['x-forwarded-for'].split(', ')[0];
  }
}

//  1.  Detect type of API (HTTP-API or REST) and process accordingly.
function getPath(event) {
  if (event.httpMethod) {
    return event.path;
  } else {
    return event.rawPath;
  }
}

const makeMobileNo = (mobileNo) => {
  let newPhone = mobileNo.replace(/[^0-9]/g, '');
  if (newPhone.startsWith('92')) newPhone = '0' + newPhone.substr(2);
  if (newPhone.startsWith('0092')) newPhone = '0' + newPhone.substr(4);
  if (newPhone.length === 11) {
    return newPhone;
  } else {
    return undefined;
  }
};

const makeCNIC = (cnic) => {
  const newCNIC = cnic.replace(/[^0-9]/g, '');
  if (newCNIC.length === 13) {
    return newCNIC;
  } else {
    return undefined;
  }
};

function makeId() {
  return randomBytes(16).toString('hex');
}

function makeTs(ts, getIso = true) {
  let returnValue = new Date();
  if (ts) {
    // we now handle the case where the timestamp is a unix timestamp or ISO string
    if (ts === parseInt(ts)) {
      returnValue = new Date(parseInt(ts));
    } else {
      returnValue = new Date(ts);
    }
  }
  if (getIso) {
    return returnValue.toISOString();
  } else {
    return returnValue;
  }
}

const isValueTrue = (value) => value === 'TRUE';

const titleCase = (str) => {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getAuthorizationToken = (event) => {
  if (!event.headers) {
    return undefined;
  }
  if (event.headers.authorization) {
    if (event.headers.authorization.split(' ')[0] !== 'Bearer')
      return undefined;
    else return event.headers.authorization.split(' ')[1];
  } else if (event.headers.Authorization) {
    if (event.headers.Authorization.split(' ')[0] !== 'Bearer')
      return undefined;
    else return event.headers.Authorization.split(' ')[1];
  }
  return undefined;
};

const unique = (array) => {
  return [...new Set(array)];
};

module.exports = {
  getApiInfo,
  getRemoteIp,
  makeId,
  makeTs,
  isValueTrue,
  titleCase,
  makeMobileNo,
  makeCNIC,
  getAuthorizationToken,
  unique,
  getPath,
};
