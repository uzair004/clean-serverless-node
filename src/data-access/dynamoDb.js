/* eslint-disable no-plusplus */
/* eslint-disable no-ternary */
'use strict';

const capacityLogLimit = 5;

const { AllDM: DM } = require('../model/dataModel');

function makeDb({ makeDbConnect, getTableName }) {
  return Object.freeze({
    putItem,
    getItem,
    updateItem,
    query,
    queryGSI,
  });

  async function putItem({ itemInfo }) {
    // Connect to the database.
    const db = makeDbConnect();

    // Prepare the item info for DynamoDB.
    const item = objectToItem({ itemInfo });

    // Create the input object for DynamoDB.
    const input = createPutItemInput({ item });

    // Put the item in the database.
    const result = await db.putItem(input).promise();

    // Return the result and remove metrics.
    return removeMetrics({ result, fnName: 'putItem', itemInfo });
  }

  async function updateItem({ itemInfo, returnValues = true }) {
    // 1. Connect to the DynamoDB table
    const db = makeDbConnect();
    // 2. Update the item in the table
    const result = await db
      .updateItem(
        createUpdateItemInput({
          item: objectToItem({ itemInfo }),
          returnValues,
        })
      )
      .promise();
    // 3. Return data from the updated item
    if (returnValues) {
      return splitKeys(
        itemToObject({
          item: removeMetrics({ result, fnName: 'updateItem', itemInfo }),
        })
      );
    }
    return removeMetrics({ result, fnName: 'updateItem', itemInfo });
  }

  // Return a single item from the database
  // itemInfo: The unique identifier for the item
  //   to retrieve from the database
  // Return: The item from the database
  async function getItem({ itemInfo }) {
    // Connect to the database
    const db = makeDbConnect();

    // Retrieve the item from the database
    const result = await db
      .getItem(createGetItemInput(objectToItem({ itemInfo })))
      .promise();

    // Return the item from the database
    return splitKeys(
      itemToObject({
        item: removeMetrics({ result, fnName: 'getItem', itemInfo }),
      })
    );
  }

  async function query({
    itemInfo,
    limit = 1,
    operator = '>=',
    statusReason,
    validOnly = false,
  }) {
    // Connect to the database
    const db = makeDbConnect();
    // Create the query input
    const result = await db
      .query(
        createQueryInput({
          itemInfo: objectToItem({ itemInfo }),
          operator,
          limit,
          statusReason,
          validOnly,
        })
      )
      .promise();

    // Return the results
    return splitKeysArray(
      itemToObjectArray({
        item: removeMetrics({ result, fnName: 'query', itemInfo }),
      })
    );
  }

  async function queryGSI({
    itemInfo,
    limit = 0,
    operator = '>=',
    statusReason,
    validOnly = false,
    status,
  }) {
    const db = makeDbConnect();
    const result = await db
      .query(
        createQueryGSIInput({
          itemInfo: objectToItem({ itemInfo }),
          operator,
          limit,
          statusReason,
          validOnly,
          status,
        })
      )
      .promise();

    return splitKeysArray(
      itemToObjectArray({
        item: removeMetrics({ result, fnName: 'queryGSI', itemInfo }),
      })
    );
  }

  function itemToObjectArray({ item }) {
    const response = [];
    item.forEach((i) => {
      response.push(itemToObject({ item: i }));
    });
    return response;
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
    if (!item.PK.S || !item.SK.S) {
      console.error(item);
      throw new Error('Missing or invalid key');
    }
    const input = {
      TableName: getTableName(),
      Item: item,
      ...(allowOverwrite && {
        ConditionExpression: 'attribute_not_exists(PK)',
      }),
      ReturnConsumedCapacity: 'TOTAL',
    };
    return input;
  }

  function createQueryInput({
    itemInfo,
    operator = '=',
    validOnly = true,
    statusReason,
    limit,
  }) {
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
    let filterExp = `(attribute_not_exists (#status) or #status = :status)`;
    if (statusReason) {
      filterExp += (filterExp ? ' and ' : '') + '#statusReason = :statusReason';
    }
    const input = {
      TableName: getTableName(),
      Limit: limit,
      KeyConditionExpression: keyCond,
      ...(validOnly && {
        FilterExpression: filterExp,
      }),

      Select: 'ALL_ATTRIBUTES',
      ExpressionAttributeNames: {
        '#PK': 'PK',
        ...(itemInfo.SK && { '#SK': 'SK' }),
        ...(validOnly && { '#status': 'status' }),
        ...(statusReason && { '#statusReason': 'statusReason' }),
      },
      ExpressionAttributeValues: {
        ':PK': {
          ...itemInfo.PK,
        },
        ...(itemInfo.SK && {
          ':SK': {
            ...itemInfo.SK,
          },
        }),
        ...(validOnly && {
          ':status': { S: '1' },
        }),
        ...(statusReason && { ':statusReason': { S: statusReason } }),
      },
      ReturnConsumedCapacity: 'TOTAL',
    };

    return input;
  }

  function createGetItemInput(item) {
    if (!item.PK.S || !item.SK.S) {
      console.error('ItemInfo:', item);
      throw new Error('Missing or invalid key');
    }
    const input = {
      TableName: getTableName(),
      Key: {
        PK: { ...item.PK },
        SK: { ...item.SK },
      },
      ReturnConsumedCapacity: 'TOTAL',
    };
    return input;
  }

  // This function creates an input object for the DynamoDB updateItem command.
  // It takes the following parameters:
  //    item: The item that will be updated
  //    returnValues: Whether or not to return the updated item (default = false)
  //    increments: An array of attributes that will be incremented (default = [])
  // The function returns an object that can be passed to the DynamoDB updateItem command.

  function createUpdateItemInput({
    item: { PK: _PK, SK: _SK, ...itemInput },
    returnValues,
    increments,
  }) {
    // Validate that the input item has a PK and SK
    if (!_PK || !_SK) {
      throw new Error('Missing or invalid key');
    }

    // Create the UpdateExpression
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

    // Create the input object for the DynamoDB updateItem command
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
      ...(returnValues && { ReturnValues: 'ALL_NEW' }),
    };
    return input;
  }

  function createQueryGSIInput({
    itemInfo,
    operator = '=',
    validOnly = true,
    statusReason,
    status,
    limit,
    index = '1',
  }) {
    // Define the names of the primary key attributes
    const _PK = 'PK' + index,
      _SK = 'SK' + index,
      _PKn = '#' + _PK,
      _PKv = ':' + _PK,
      _SKn = '#' + _SK,
      _SKv = ':' + _SK,
      indexName = 'GSI' + index;

    // Ensure the index is valid
    if (!['1', '2'].includes(index)) {
      throw new Error(`Index can only be '1' or '2'`);
    }

    // Ensure the itemInfo contains the required attributes
    if (!itemInfo[_PK] || !itemInfo[_SK]) {
      throw new Error(
        `${indexName} requires attributes ({_PK${index}}, {_SK${index}}).`
      );
    }

    // Ensure the operator is valid
    if (!['=', '>', '>=', '<', '<=', 'begins_with'].includes(operator)) {
      throw new Error('Invalid KeyConditionExpression operator');
    }

    // Define the attribute names
    const attributeNames = {},
      attributeValues = {};

    // Define the primary key attribute names
    attributeNames[_PKn] = _PK;
    attributeValues[_PKv] = { ...itemInfo[_PK] };
    attributeNames[_SKn] = _SK;
    attributeValues[_SKv] = { ...itemInfo[_SK] };

    // Define the filter expression
    let filterExp = validOnly
      ? '(attribute_not_exists (#expiryTs) or #expiryTs > :expiryTs)'
      : '';
    filterExp +=
      (filterExp ? ' and ' : '') +
      '(attribute_not_exists (#status) or #status = :status)';
    if (statusReason) {
      filterExp += (filterExp ? ' and ' : '') + '#statusReason = :statusReason';
    }

    // Define the key condition expression
    let keyCond = '#PK1 = :PK1 ';
    if (itemInfo.SK1) {
      if (operator === 'begins_with') {
        keyCond += 'and begins_with(#SK1,:SK1)';
      } else {
        keyCond += `and #SK1 ${operator} :SK1`;
      }
    }

    /**
     * Returns a list of items matching the specified filter and limit
     * @param {string} filter
     * @param {number} limit
     * @param {string} indexName
     * @param {string} keyCond
     * @param {object} attributeNames
     * @param {object} attributeValues
     * @param {boolean} validOnly
     * @param {string} status
     * @param {string} statusReason
     * @returns {Promise<*>}
     */

    const input = {
      TableName: getTableName(),
      // If the limit is greater than 0, limit the number of results returned
      ...(limit > 0 && { Limit: limit }),
      // Use the specified index
      IndexName: indexName,
      // Filter the results by the specified key condition
      KeyConditionExpression: keyCond,

      // If validOnly is true, add a filter expression for the expiry timestamp and status
      ...(validOnly && {
        ...(filterExp && { FilterExpression: filterExp }),
      }),

      // Return all attributes
      Select: 'ALL_ATTRIBUTES',
      // Add the specified attribute names
      ExpressionAttributeNames: {
        ...attributeNames,
        ...(validOnly && {
          '#expiryTs': 'expiryTs',
          '#status': 'status',
          '#statusReason': 'statusReason',
        }),
      },
      // Add the specified attribute values
      ExpressionAttributeValues: {
        ...attributeValues,
        ...(validOnly && {
          ':expiryTs': { S: new Date().toISOString() },
          ':status': { S: status },
          ':statusReason': { S: statusReason },
        }),
      },
      // Return the capacity used by the operation
      ReturnConsumedCapacity: 'TOTAL',
    };

    return input;
  }

  /**
   * Remove metrics from a DynamoDB result
   * @param {object} result - The result from a DynamoDB function
   * @param {string} fnName - The name of the function
   * @returns {object} - The original result without metrics
   */
  function removeMetrics({ result, fnName }) {
    // Extract metrics from the result object
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
    // Log consumed capacity if it is above the limit
    if (consumedCapacity.CapacityUnits > capacityLogLimit) {
      console.warn(
        `Consumed Capacity [${fnName}]:= ${JSON.stringify(consumedCapacity)}`
      );
    }
    // Log additional metrics
    console.warn(
      `Consumed Capacity [${fnName}]:= ${JSON.stringify(consumedCapacity)}`
    );
    console.warn('Additional Metrics', {
      ...(itemCollMetrics && { itemCollMetrics }),
      ...(count && { count }),
      ...(scannedCount && { scannedCount }),
      ...(lastEvaluatedKey && { lastEvaluatedKey }),
    });
    // Return the original result without metrics
    return item || items || attributes || remaining;
  }

  function splitKeysArray(item) {
    return item.map((i) => splitKeys(i));
  }

  /**
   * This code is used to split the keys of a given item.
   *
   * @param item The item to split the keys of.
   * @return The split keys of the given item.
   */
  function splitKeys(item) {
    // If there is no item, return an empty item.
    if (item.length === 0) {
      return item;
    }

    // Split the keys for each type of item.
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

    // Return an object that contains the split keys and the result info.
    return Object.assign(
      !_PK ? {} : DM[_type].splitPK(_PK),
      !_SK ? {} : DM[_type].splitSK(_SK),
      !_PK1 ? {} : DM[_type].splitPK1(_PK1),
      !_SK1 ? {} : DM[_type].splitSK1(_SK1),
      !_PK2 ? {} : DM[_type].splitPK2(_PK2),
      !_SK2 ? {} : DM[_type].splitSK2(_SK2),
      _type ? { type: _type } : {},
      !resultInfo ? {} : resultInfo
    );
  }
}

module.exports = {
  makeDb,
};
