'use strict';
const { ulid } = require('ulid');

function getApiInfo(event) {
  let splitPath;
  if (event.path) {
    splitPath = event.path.split('/'); // for rest APIs
  } else {
    splitPath = event.rawPath.split('/'); // for http APIs
  }
  const apiInfo = {
    apiVersion: splitPath[1],
    apiCategory: splitPath[2],
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

function makeId() {
  return ulid();
}

function makeTs() {
  return new Date().valueOf();
}

const isValueTrue = (value) => value.toUpperCase() === 'TRUE';

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

const createSuccessResponseHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*',
  Accept: '*',
});

const missingItem = (item) => {
  return {
    response: {
      statusCode: 400,
      body: { message: `Missing ${item}` },
    },
  };
};

const head = (array) => {
  if (array !== null && array.length) {
    return array[0];
  } else {
    return undefined;
  }
};

const isValidEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const isValidPhone = (phone) => {
  return String(phone).match(/^(03(0|1|2|3|4)\d{8})$/);
};


const obfuscateEmail = (email) => {
  const regex = /(\w)(.+?)(@)(\w)(.*?)(.\w+$)/gm;
  const subst = `$1***$3$4***$6`; // substitute with
  return email.replace(regex, subst);
};

const getBackendUrl = () => {
  const { IS_OFFLINE, BACKEND_API_URL } = process.env;

  if (isValueTrue(IS_OFFLINE)) return 'http://localhost:3000';
  else return `https://${BACKEND_API_URL}`;
};

const jsonToCsv = (
  json,
  quote = `"`,
  valDelimiter = ',',
  lineDelimiter = '\n'
) => {
  if (!json || Object.keys(json).length === 0) return '';

  const quoDel = quote.concat(valDelimiter, quote);

  const csv = `${quote}${Object.keys(json[0]).join(
    quoDel
  )}${quote}${lineDelimiter}${json
    .map((object) => quote.concat(Object.values(object).join(quoDel)))
    .join(quote.concat(lineDelimiter))}${quote}`;

  return csv;
};

const csvToJson = (csv) => {
  let lines;
  if (csv.match('\r\n')) {
    lines = csv.split('\r\n');
  } else if (csv.match('\n')) {
    lines = csv.split('\n');
  } else {
    lines = csv;
  }
  const result = [];
  const headersString = lines[0];

  let splitIndex = 0;
  const regex = /cnic|userId/i;
  if (regex.test(headersString)) {
    splitIndex = 1; // header do exist, so skip it
  }
  const linesWithoutHeader = lines.slice(splitIndex);

  const headers = headersString.split(',');

  linesWithoutHeader.map((line) => {
    const obj = {};
    const currentline = line.split(',');
    headers.map((header, index) => {
      obj['userId'] = currentline[index];
    });
    // obj["userId"] = line; // can be used to avoid headers.map

    result.push(obj);
  });

  return result;
};

function replaceChar(obj, { toReplace, replaceBy }) {
  const newObj = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'string') {
      newObj[key] = value.replace(toReplace, replaceBy);
    } else {
      newObj[key] = value;
    }
  });

  return newObj;
}

function replaceUndefined(obj) {
  const newObj = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined) {
      newObj[key] = '';
    } else {
      newObj[key] = value;
    }
  });

  return newObj;
}

// Note: Following functions return a set.
function union(a, b) {
  return new Set([...a, ...b]);
}

function minus(a, b) {
  return new Set(Array.from(a).filter((x) => !b.has(x)));
}


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
  createSuccessResponseHeaders,
  missingItem,
  head,
  isValidEmail,
  isValidPhone,
  obfuscateEmail,
  getBackendUrl,
  jsonToCsv,
  replaceChar,
  csvToJson,
  replaceUndefined,
  union,
  minus,
};
