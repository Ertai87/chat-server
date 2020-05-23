const AWS = require('aws-sdk');
const sqs = new AWS.SQS();
const dynamodb = new AWS.DynamoDB();
const sns = new AWS.SNS();
const constants = require('./constants.js');
const common = require('./common.js');

exports.handler = (event, context, callback) => {
    if (!(event.userId)) {
        return callback(common.errorMessage("400", "UserID not provided"), null);
    }

    return common.userExists(event.userId)
    .then(data => data ? data : callback(common.errorMessage("400", "User does not exist"), null))
    .then(data => {
        let sqsPromise = deleteQueuePromise(data.QueueUrl.S);
        let snsPromise = deleteSubscriptionPromise(data.SubscriptionArn.S);
        let dynamoPromise = deleteDynamoEntryPromise(event.userId, data.ActiveChatroom.S);

        return Promise.all([dynamoPromise, sqsPromise, snsPromise]);
    })
    .then(() => callback(null, {
        statusCode: 200,
        body: ''
    }))
    .catch(err => common.handleServiceError(err, callback));
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

/* Actually we only want to delete by userId but the AWS SDK requires the sort key
    to delete, so we have to provide it :(
*/
const deleteDynamoEntryPromise = (userId, chatRoom) => {
    return dynamodb.deleteItem({
        Key: {
            "UserId": {
               S: userId
            },
            "ActiveChatroom": {
                S: chatRoom
            }
        },
        TableName: constants.userTableName
    }).promise()
    .then(() => console.log("Successfully removed user " + userId + " from DynamoDB"));
}