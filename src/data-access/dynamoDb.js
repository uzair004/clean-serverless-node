/* eslint-disable no-plusplus */
/* eslint-disable no-ternary */
'use strict';

const capacityLogLimit = 5;

const { AllDM: DM } = require('../model/dataModel');

function makeDb({ makeDbConnect, getTableName }) {
  //, createPutItemInput }) {
  return Object.freeze({
    putItem,
    getItem,
    updateItem,
    query,
    queryGSI,
    deleteItem,
    increment,
  });

  async function query({
    itemInfo,
    mapping,
    validOnly = true,
    operator = '>=',
    statusReason,
  }) {
    const db = makeDbConnect();
    const result = await db
      .query(
        createQueryInput({
          itemInfo: objectToItem({ itemInfo, mapping: mapping.toItem() }),
          operator,
          validOnly,
          statusReason,
        })
      )
      .promise();

    return splitKeysArray(
      itemToObjectArray({
        item: removeMetrics({ result, fnName: 'query', itemInfo }),
        mapping: mapping.toObject(),
      })
    );
  }

  async function queryGSI({
    itemInfo,
    mapping,
    validOnly = true,
    statusReason,
    status,
    limit = 10,
    operator = '>=',
  }) {
    const db = makeDbConnect();
    const result = await db
      .query(
        createQueryGSIInput({
          itemInfo: objectToItem({ itemInfo, mapping: mapping.toItem() }),
          operator: operator,
          validOnly,
          statusReason,
          status,
          limit,
        })
      )
      .promise();

    return splitKeysArray(
      itemToObjectArray({
        item: removeMetrics({ result, fnName: 'queryGSI', itemInfo }),
        mapping: mapping.toObject(),
      })
    );
  }

  async function updateItem({ itemInfo, mapping, returnValues = true }) {
    const db = makeDbConnect();
    const result = await db
      .updateItem(
        createUpdateItemInput({
          item: objectToItem({ itemInfo, mapping: mapping.toItem() }),
          returnValues,
        })
      )
      .promise();

    if (returnValues) {
      return splitKeys(
        itemToObject({
          item: removeMetrics({ result, fnName: 'updateItem', itemInfo }),
          mapping: mapping.toObject(),
        })
      );
    }
    return removeMetrics({ result, fnName: 'putItem', itemInfo });
  }

  async function increment({ itemInfo, mapping }) {
    const { increments, ...requestInfo } = itemInfo;
    const db = makeDbConnect();
    const result = await db
      .updateItem(
        createUpdateItemInput({
          increments,
          item: objectToItem({
            itemInfo: {
              ...requestInfo,
            },
            mapping: mapping.toItem(),
          }),
        })
      )
      .promise();

    return removeMetrics({ result, fnName: 'updateUsage', itemInfo });
  }

  async function deleteItem({ itemInfo, mapping }) {
    const db = makeDbConnect();
    const response = await db
      .deleteItem(
        createDeleteItemInput({
          item: objectToItem({ itemInfo, mapping: mapping.toItem() }),
        })
      )
      .promise();
    return response;
  }

  async function putItem({ itemInfo, mapping }) {
    const db = makeDbConnect();
    const result = await db
      .putItem(
        createPutItemInput(
          objectToItem({ itemInfo, mapping: mapping.toItem() })
        )
      )
      .promise();
    return removeMetrics({ result, fnName: 'putItem', itemInfo });
  }

  async function getItem({ itemInfo }) {
    const db = makeDbConnect();
    const result = await db
      .getItem(createGetItemInput(objectToItem({ itemInfo })))
      .promise();
    return splitKeys(
      itemToObject({
        item: removeMetrics({ result, fnName: 'getItem', itemInfo }),
      })
    );
  }
  function objectToItem({ itemInfo: obj }) {
    const response = {};
    Object.keys(obj).forEach((element) => {
      if (obj[element]) {
        switch (obj[element].constructor.name) {
          case 'Number': {
            response[element] = { N: obj[element].toString() };
            break;
          }
          case 'Array': {
            response[element] = objectArrayToItem({ itemInfo: obj[element] });
            break;
          }
          case 'Object': {
            response[element] = objectMapToItem({ itemInfo: obj[element] });
            break;
          }
          case 'Boolean': {
            response[element] = { BOOL: obj[element] };
            break;
          }
          default: {
            response[element] = { S: obj[element] };
            break;
          }
        }
      }
    });
    return response;
  }

  function objectArrayToItem({ itemInfo }) {
    const response = { L: [] };

    itemInfo.forEach((element) => {
      switch (element.constructor.name) {
        case 'Number': {
          response.L.push({ N: element.toString() });
          break;
        }
        case 'Array': {
          response.L.push(objectArrayToItem({ itemInfo: element }));
          break;
        }
        case 'Object': {
          response.L.push(objectMapToItem({ itemInfo: element }));
          break;
        }
        case 'Boolean': {
          response.L.push({ BOOL: element });
          break;
        }
        default: {
          response.L.push({ S: element });
        }
      }
    });
    return response;
  }

  function objectMapToItem({ itemInfo }) {
    const response = { M: {} };

    Object.keys(itemInfo).forEach((element) => {
      if (!itemInfo[element]) return;
      switch (itemInfo[element].constructor.name) {
        case 'Number': {
          response.M[element] = { N: itemInfo[element].toString() };
          break;
        }
        case 'Array': {
          response.M[element] = objectArrayToItem({
            itemInfo: itemInfo[element],
          });
          break;
        }
        case 'Object': {
          response.M[element] = objectMapToItem({
            itemInfo: itemInfo[element],
          });
          break;
        }
        case 'Boolean': {
          response.M[element] = { BOOL: itemInfo[element] };
          break;
        }
        default: {
          response.M[element] = { S: itemInfo[element] };
        }
      }
    });
    return response;
  }
  function itemToObjectArray({ item }) {
    const response = [];
    item.forEach((i) => {
      response.push(itemToObject({ item: i }));
    });
    return response;
  }

  function itemToObject({ item }) {
    const validDataTypes = ['S', 'N', 'BOOL', 'L', 'M'];
    const response = {};
    Object.keys(item).forEach((element) => {
      const dataType = Object.keys(item[element]);
      if (dataType.length > 1) {
        console.warn('multiple data types ', dataType);
      }
      if (dataType && dataType[0] && validDataTypes.includes(dataType[0])) {
        response[element] = itemToValue({
          item: item[element],
          dataType: dataType[0],
        });
      }
    });
    return response;
  }

  function itemToValue({ item, dataType }) {
    let response;
    switch (dataType) {
      case 'N':
        return parseInt(item[dataType]);
      case 'L':
        response = [];
        item[dataType].forEach((item) =>
          response.push(itemToValue({ item, dataType: Object.keys(item)[0] }))
        );
        return response;
      case 'M':
        response = {};
        Object.keys(item[dataType]).forEach((i) => {
          response[i] = itemToValue({
            item: item[dataType][i],
            dataType: Object.keys(item[dataType][i])[0],
          });
        });
        return response;
      default:
        return item[dataType];
    }
  }

  function createPutItemInput(item, allowOverwrite = false) {
    // ".S" hardcoded for now. Can spread operator be used to remove? I think NO!
    if (!item.PK.S || !item.SK.S) {
      console.error(item);
      throw new Error('Missing or invalid key');
    }
    const input = {
      TableName: getTableName(),
      Item: item, // objectToItem(itemInfo),
      ...(allowOverwrite && {
        ConditionExpression: 'attribute_not_exists(PK)',
      }),
      ReturnConsumedCapacity: 'TOTAL',
    };
    return input;
  }
  function createGetItemInput(item) {
    //  Can spread operator be used to remove hardcoded S ?
    if (!item.PK.S || !item.SK.S) {
      console.error('ItemInfo:', item);
      throw new Error('Missing or invalid key');
    }
    const input = {
      TableName: getTableName(),
      Key: {
        PK: { ...item.PK }, //  Shallow copy ok for PK and SK. But not for lists, etc.
        SK: { ...item.SK },
      },
      //    ProjectionExpression: '',  // No expression => All columns,
      ReturnConsumedCapacity: 'TOTAL',
    };
    return input;
  }
  function createUpdateItemInput({
    item: { PK: _PK, SK: _SK, ...itemInput },
    returnValues,
    increments,
  }) {
    if (!_PK || !_SK) {
      console.error('ItemInfo:', itemInput);
      throw new Error('Missing or invalid key');
    }
    let exp = 'SET',
      i = 0;
    const values = {},
      names = {};
    if (increments)
      increments.forEach((element) => {
        exp =
          exp +
          (i++ ? ',' : '') +
          ' #' +
          element.attName +
          '=' +
          `if_not_exists(#${element.attName}, :${element.attName})` +
          // ' #' +
          // element.attName +
          '+:' +
          element.attName;
        values[`:${element.attName}`] = { N: element.inc.toString() };
        names[`#${element.attName}`] = element.attName;
      });
    Object.keys(itemInput).forEach((element) => {
      exp = exp + (i++ ? ',' : '') + ' #' + element + '=:' + element;
      values[`:${element}`] = { ...itemInput[element] };
      names[`#${element}`] = element;
    });
    const input = {
      TableName: getTableName(),
      Key: {
        PK: { ..._PK },
        SK: { ..._SK },
      },
      UpdateExpression: exp,
      ExpressionAttributeValues: values,
      ExpressionAttributeNames: names,
      ReturnConsumedCapacity: 'TOTAL',
      ...(returnValues && { ReturnValues: 'ALL_NEW' }), //   NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW
    };
    return input;
  }
  function createDeleteItemInput({ item: { PK: _PK, SK: _SK } }) {
    if (!_PK || !_SK) {
      console.error('PK: ', _PK, 'SK: ', _SK);
      throw new Error('Missing or invalid key');
    }

    const input = {
      TableName: getTableName(),
      Key: {
        PK: { ..._PK },
        SK: { ..._SK },
      },
    };
    return input;
  }

  /**TODO: WIP. To be completed to support KeyConditions and other conditions */
  function createQueryInput({
    itemInfo,
    operator = '=',
    validOnly = true,
    statusReason,
  }) {
    //  This can't work for all cases. Handling required cases only for now.
    //  Obtain KeyConditionExpression and other info directly as input.
    if (!itemInfo.PK) {
      console.error(itemInfo);
      throw new Error('Missing or invalid key');
    }
    if (
      !['=', '>', '>=', '<', '<=', 'begins_with', 'between'].includes(operator)
    ) {
      console.error(itemInfo);
      throw new Error('Invalid KeyConditionExpression operator');
    }

    let keyCond = '#PK = :PK ';
    if (itemInfo.SK) {
      if (operator === 'begins_with') {
        keyCond += 'and begins_with(#SK,:SK)';
      } else {
        keyCond += `and #SK ${operator} :SK`;
      }
    }
    // TODO: Support for ${operator} values "begins_with" and "between" to be implemented
    let filterExp = `(attribute_not_exists (#expiryTs) or #expiryTs > :expiryTs) and (attribute_not_exists (#status) or #status = :status)`;
    if (statusReason) {
      filterExp += (filterExp ? ' and ' : '') + '#statusReason = :statusReason'; // and #createTs > :createTs
    }
    const input = {
      TableName: getTableName(),
      // ScanIndexForward: false,
      // Limit: 2,
      // IndexName: 'GSI1',
      KeyConditionExpression: keyCond,
      // '#PK = :PK ' + (itemInfo.SK ? `and #SK ${operator} :SK` : ''),

      ...(validOnly && {
        // FilterExpression: `attribute_not_exists (#expiryTs) or #expiryTs > :expiryTs `,
        FilterExpression: filterExp,
      }),

      Select: 'ALL_ATTRIBUTES', //  ALL_ATTRIBUTES | ALL_PROJECTED_ATTRIBUTES | SPECIFIC_ATTRIBUTES | COUNT
      ExpressionAttributeNames: {
        '#PK': 'PK',
        ...(itemInfo.SK && { '#SK': 'SK' }),
        ...(validOnly && { '#expiryTs': 'expiryTs', '#status': 'status' }),
        ...(statusReason && { '#statusReason': 'statusReason' }),
      },
      ExpressionAttributeValues: {
        ':PK': {
          ...itemInfo.PK, //  Automatically fetch the datatype
        },
        ':SK': {
          ...itemInfo.SK,
        },
        ...(validOnly && {
          ':expiryTs': { S: new Date().toISOString() },
          ':status': { S: '1' },
        }),
        ...(statusReason && { ':statusReason': { S: statusReason } }),
      },
      ReturnConsumedCapacity: 'TOTAL',
    };
    return input;
  }

  function createQueryGSIInput({
    itemInfo,
    operator = '=',
    validOnly = true,
    statusReason = 'pending', // Hardcoded for now for findPendingRequest()
    index = '1',
    scanIndexForward = false,
    limit = 10,
    status = '1',
  }) {
    //  This can't work for all cases. Handling required cases only for now.
    //  Obtain KeyConditionExpression and other info directly as input.
    const _PK = 'PK' + index,
      _SK = 'SK' + index,
      _PKn = '#' + _PK,
      _PKv = ':' + _PK,
      _SKn = '#' + _SK,
      _SKv = ':' + _SK,
      indexName = 'GSI' + index;

    if (!['1', '2'].includes(index)) {
      console.error(itemInfo);
      throw new Error(`Index can only be '1' or '2'`);
    }
    if (!itemInfo[_PK] || !itemInfo[_SK]) {
      console.error(itemInfo);
      throw new Error(
        `${indexName} requires attributes ({_PK${index}}, {_SK${index}}).`
      );
    }
    if (
      !['=', '>', '>=', '<', '<=', 'begins_with', 'between'].includes(operator)
    ) {
      console.error(itemInfo);
      throw new Error('Invalid KeyConditionExpression operator');
    }

    // let keyCond = `${_PKn} = :${_PKv} `;
    // if (itemInfo.SK) {
    //   if (operator === `begins_with`) {
    //     keyCond += `and begins_with(${_SKn},:${_SKv})`;
    //   } else {
    //     keyCond += `and ${_SKn},${_SKv})`;
    //   }
    // }
    const attributeNames = {},
      attributeValues = {};

    attributeNames[_PKn] = _PK;
    attributeValues[_PKv] = { ...itemInfo[_PK] };
    attributeNames[_SKn] = _SK;
    attributeValues[_SKv] = { ...itemInfo[_SK] };

    let filterExp = validOnly
      ? '(attribute_not_exists (#expiryTs) or #expiryTs > :expiryTs)'
      : '';
    filterExp +=
      (filterExp ? ' and ' : '') +
      '(attribute_not_exists (#status) or #status = :status)';
    if (statusReason) {
      filterExp += (filterExp ? ' and ' : '') + '#statusReason = :statusReason'; // and #createTs > :createTs
    }
    // TODO: Support for ${operator} values "begins_with" and "between" to be implemented
    const input = {
      TableName: getTableName(),
      ScanIndexForward: scanIndexForward,
      ...(limit > 0 && { Limit: limit }),
      IndexName: indexName,
      KeyConditionExpression:
        `${_PKn} = ${_PKv} ` +
        (itemInfo[_SK] ? `and ${_SKn} ${operator} ${_SKv}` : ''),

      ...(validOnly && {
        ...(filterExp && { FilterExpression: filterExp }),
      }),

      Select: 'ALL_ATTRIBUTES', //  ALL_ATTRIBUTES | ALL_PROJECTED_ATTRIBUTES | SPECIFIC_ATTRIBUTES | COUNT
      ExpressionAttributeNames: {
        ...attributeNames,
        ...(validOnly && {
          '#expiryTs': 'expiryTs',
          '#status': 'status',
          '#statusReason': 'statusReason',
          // #SKn is the same as '#startTs'. So this is redundant. May be required for fetching data
          // for entities later.
          // '#createTs' : 'createTs'
        }),
      },
      ExpressionAttributeValues: {
        ...attributeValues, //  Use deep copy if this causes any issues
        ...(validOnly && {
          ':expiryTs': { S: new Date().toISOString() },
          ':status': { S: status },
          ':statusReason': { S: statusReason },
          // ':createTs': {
          //   S: new Date(new Date() - 2 * 60 * 1000).toISOString(),
          // }, // Requests created in last 2 minutes
        }),
      },
      ReturnConsumedCapacity: 'TOTAL',
    };
    return input;
  }

  function removeMetrics({ result, fnName }) {
    const {
      Count: count,
      ScannedCount: scannedCount,
      LastEvaluatedKey: lastEvaluatedKey,
      ConsumedCapacity: consumedCapacity,
      ItemCollectionMetrics: itemCollMetrics,
      Attributes: attributes,
      Item: item,
      Items: items,
      ...remaining
    } = result;
    if (consumedCapacity.CapacityUnits > capacityLogLimit) {
      console.warn(
        `Consumed Capacity [${fnName}]:= ${JSON.stringify(consumedCapacity)}`
      );
    }
    console.warn(
      `Consumed Capacity [${fnName}]:= ${JSON.stringify(consumedCapacity)}`
    );
    console.warn(
      'Item Collection Metrics: ',
      itemCollMetrics,

      'Count',
      count,

      'ScannedCount',
      scannedCount,

      'LastEvaluatedKey',
      lastEvaluatedKey
    );
    return item || items || attributes || remaining;
  }

  // TODO: Move splitKeys and other "model" related functions to the model module.
  function splitKeys(item) {
    if (item.length === 0) {
      return item;
    }

    const {
      PK: _PK,
      SK: _SK,
      PK1: _PK1,
      SK1: _SK1,
      PK2: _PK2,
      SK2: _SK2,
      type: _type,
      ...resultInfo
    } = item;

    return Object.assign(
      !_PK ? {} : DM[_type].splitPK(_PK),
      !_SK ? {} : DM[_type].splitSK(_SK),
      !_PK1 ? {} : DM[_type].splitPK1(_PK1),
      !_SK1 ? {} : DM[_type].splitSK1(_SK1),
      !_PK2 ? {} : DM[_type].splitPK2(_PK2),
      !_SK2 ? {} : DM[_type].splitSK2(_SK2),
      { type: _type },
      !resultInfo ? {} : resultInfo
    );
  }

  function splitKeysArray(item) {
    return item.map((i) => splitKeys(i));
  }
}

module.exports = {
  makeDb,
};
