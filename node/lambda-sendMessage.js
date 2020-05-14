const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();
const sns = new AWS.SNS();
const constants = require('./constants.js')
const privateConstants = require('./privateConstants.js'); //This file is not available in Github
const common = require('./common.js');
const snsTopicArn = "arn:aws:sns:" + constants.awsRegion + ":" + privateConstants.awsId + ":message-topic";

exports.handler = (event, context, callback) => {
    if (!(event.userId) || !(event.message)) {
        return callback(common.errorMessage("400", "Required parameter not provided"), null);
    }

    return common.userExists(event.userId)
    .then(exists => exists ? {} : callback(common.errorMessage("400","User does not exist"), null))

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
    .catch(err => common.handleServiceError(err, callback));
}