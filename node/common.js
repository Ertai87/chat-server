const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();
const constants = require('./constants.js');

exports.userExists = (userId) => {
    return dynamodb.query({
        ExpressionAttributeValues: {
        ":userId": {
                S: userId
            }
        },
        KeyConditionExpression: "UserId = :userId", 
        TableName: constants.userTableName
    }).promise()
    .then(data => data.Items[0]);
}

exports.errorMessage = (code, text) => {
    return constants.errorCodes[code] + ": " + text;
}

exports.handleServiceError = (err, callback) => {
    console.log("Error: " + err);
    return callback(constants.errorCodes["500"] + ": " + err, null);
}