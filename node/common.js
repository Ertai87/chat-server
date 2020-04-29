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