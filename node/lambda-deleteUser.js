const AWS = require('aws-sdk');
const sqs = new AWS.SQS();
const dynamodb = new AWS.DynamoDB();
const sns = new AWS.SNS();
const constants = require('./constants.js');
const common = require('./common.js');

exports.handler = (event, context, callback) => {
    if (!(event.userId)) {
        return callback("UserID not provided", null);
    }

    return common.userExists(event.userId)
    .then(data => data ? data : callback("User does not exist", null))
    .then(data => {
        let sqsPromise = deleteQueuePromise(data.QueueUrl.S);
        let snsPromise = deleteSubscriptionPromise(data.SubscriptionArn.S);
        let dynamoPromise = deleteDynamoEntryPromise(event.userId);

        return Promise.all([dynamoPromise, sqsPromise, snsPromise]);
    })
    .then(() => callback(null, {
        statusCode: 200,
        body: ''
    }))
    .catch(err => {
        console.log("Error: " + err);
        return callback(err, null);
    });
}

const deleteQueuePromise = (queueUrl) => {
    return sqs.deleteQueue({
        QueueUrl: queueUrl
    }).promise()
    .then(() => console.log("Successfully deleted SQS queue " + queueUrl));
}

const deleteSubscriptionPromise = (subscriptionArn) => {
    return sns.unsubscribe({
        SubscriptionArn: subscriptionArn
    }).promise()
    .then(() => console.log("Successfully deleted subscription " + subscriptionArn));
}

const deleteDynamoEntryPromise = (userId) => {
    return dynamodb.deleteItem({
        Key: {
            "UserId": {
               S: userId
            }
        },
        TableName: constants.userTableName
    }).promise()
    .then(() => console.log("Successfully removed user " + userId + " from DynamoDB"));
}