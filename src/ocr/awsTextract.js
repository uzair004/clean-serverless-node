'use strict';
const { values, has, includes } = require('lodash');
const AWS = require('aws-sdk');

function makeAwsTexract({ featuresTypes }) {
  return async function awsTexract({ photoId, confidenceThreshold }) {
    const response = await extractInformation({ photoId, featuresTypes });

    const { keyMap, valueMap, blockMap } = getKeyValueMap(response.Blocks);
    const result = getKeyValueRelationship({
      keyMap,
      valueMap,
      blockMap,
      confidenceThreshold,
    });

    return { result, rawData: response };
  };
}

const extractInformation = ({ photoId, featuresTypes }) => {
  const textract = new AWS.Textract();

  const params = {
    Document: {
      S3Object: {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Name: photoId,
      },
    },
    FeatureTypes: featuresTypes,
  };

  return textract.analyzeDocument(params).promise();
};

const getText = (result, blocksMap, confidenceThreshold) => {
  let text = '';
  let confidence = 100;

  if (has(result, 'Relationships')) {
    result.Relationships.forEach((relationship) => {
      if (relationship.Type === 'CHILD') {
        relationship.Ids.forEach((childId) => {
          const word = blocksMap[childId];
          if (word.BlockType === 'WORD') {
            text += `${word.Text} `;
            confidence = Math.min(confidence, word.Confidence);
          }
          if (word.BlockType === 'SELECTION_ELEMENT') {
            if (word.SelectionStatus === 'SELECTED') {
              text += ` X`;
            }
          }
        });
      }
    });
  }
  if (meetConfidence(confidence, confidenceThreshold)) {
    return { word: text.trim(), confidence };
  } else return { word: '', confidence };
};

const meetConfidence = (confidence, confidenceThreshold) =>
  confidence >= confidenceThreshold;

const findValueBlock = (keyBlock, valueMap) => {
  let valueBlock;
  keyBlock.Relationships.forEach((relationship) => {
    if (relationship.Type === 'VALUE') {
      relationship.Ids.every((valueId) => {
        if (has(valueMap, valueId)) {
          valueBlock = valueMap[valueId];
          return false;
        }
      });
    }
  });

  return valueBlock;
};

const getKeyValueRelationship = ({
  keyMap,
  valueMap,
  blockMap,
  confidenceThreshold,
}) => {
  const keyValues = {};

  const keyMapValues = values(keyMap);

  keyMapValues.forEach((keyMapValue) => {
    const valueBlock = findValueBlock(keyMapValue, valueMap);
    const key = getText(keyMapValue, blockMap, confidenceThreshold).word;
    const value = getText(valueBlock, blockMap, confidenceThreshold);
    if (key) keyValues[key] = value;
  });

  return keyValues;
};

const getKeyValueMap = (blocks) => {
  const keyMap = {};
  const valueMap = {};
  const blockMap = {};

  let blockId;
  blocks.forEach((block) => {
    blockId = block.Id;
    blockMap[blockId] = block;

    if (block.BlockType === 'KEY_VALUE_SET') {
      if (includes(block.EntityTypes, 'KEY')) {
        keyMap[blockId] = block;
      } else {
        valueMap[blockId] = block;
      }
    }
  });

  return { keyMap, valueMap, blockMap };
};

module.exports = { makeAwsTexract };
