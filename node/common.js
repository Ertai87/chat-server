const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();
const constants = require('./constants.js');

exports.userExists = (userId) => {
    return dynamodb.getItem({
        Key: {
            "UserId": {
                S: userId
            }
        },
        TableName: constants.userTableName
    }).promise()
    .then(data => data.Item);
}

exports.errorMessage = (code, text) => {
    return constants.errorCodes[code] + ": " + text;
}

exports.handleServiceError = (err, callback) => {
    console.log("Error: " + err);
    return callback(constants.errorCodes["500"] + ": " + err, null);
}