const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();
const sns = new AWS.SNS();
const constants = require('./constants.js')
const privateConstants = require('./privateConstants.js'); //This file is not available in Github
const snsTopicArn = "arn:aws:sns:" + constants.awsRegion + ":" + privateConstants.awsId + ":message-topic";

exports.handler = (event, context, callback) => {
    if (!(event.userId) || !(event.message)) {
        return callback("Required parameter not provided", null);
    }

    return dynamodb.getItem({
        Key: {
            "UserId": {
               S: event.userId
            }
        },
        TableName: constants.userTableName
    }).promise()
    .then(data => !(data.Item) ? callback("User does not exist", null) : {})

    .then(() => sns.publish({
            Message: event.userId + ": " + event.message,
            TopicArn: snsTopicArn
        }).promise()
    )
    .then(data => console.log("Successfully published message '" + event.message + "'to server"))

    .then(() => callback(null, {
        statusCode: 200,
        body: ''
    }))
    .catch(err => console.log("Error: " + err));
}