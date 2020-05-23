const AWS = require('aws-sdk');
const sqs = new AWS.SQS();
const dynamodb = new AWS.DynamoDB();
const sns = new AWS.SNS();
const constants = require('./constants.js');
const privateConstants = require('./privateConstants.js'); //This file is not available in Github
const common = require('./common.js');
const snsTopicArn = "arn:aws:sns:" + constants.awsRegion + ":" + privateConstants.awsId + ":message-topic";

var sqsData = {};

exports.handler = (event, context, callback) => {
    if (!(event.userId)) {
        return callback(common.errorMessage("400", "UserID not provided"), null);
    }

    return common.userExists(event.userId)
    .then(exists => exists ? callback(common.errorMessage("400", "User already exists"), null) : {})

    .then(() => createSqsQueuePromise(event.userId))
    .then(() => subscribeQueueToSnsPromise(sqsData.QueueUrl, sqsData.QueueArn))
    .then(() => putDynamoDbPromise(event.userId, sqsData.QueueUrl, sqsData.SubscriptionArn))

    .then(() => callback(null, {
        statusCode: 200,
        body: ''
    }))
    .catch(err => common.handleServiceError(err, callback));
}

const putDynamoDbPromise = (userId, queueUrl, subscriptionArn) => {
    return dynamodb.putItem({
        Item: {
            "UserId": {
                S: userId
            },
            "ActiveChatroom": {
                S: "main"
            },
            "QueueUrl": {
                S: queueUrl
            },
            "SubscriptionArn": {
                S: subscriptionArn
            }
        },
        TableName: constants.userTableName
    }).promise()
    .then(data => console.log("Successfully wrote " + userId + " to DynamoDB"));
}

const createSqsQueuePromise = (userId) => {
    return sqs.createQueue({
        QueueName: userId
    }).promise()
    .then(createQueueData => sqsData["QueueUrl"] = createQueueData.QueueUrl)
    .then(() => sqs.getQueueAttributes({
            QueueUrl: sqsData.QueueUrl,
            AttributeNames: ['QueueArn']
    }).promise())
    .then(getQueueAttributesData =>
        sqsData["QueueArn"] = getQueueAttributesData.Attributes.QueueArn)
    .then(() => console.log("Successfully created queue " + sqsData.QueueArn));
}

const subscribeQueueToSnsPromise = (queueUrl, queueArn) => {
    let setPolicyPromise = sqs.setQueueAttributes({
        Attributes: {
            'Policy': '{' +
                '\"Version\": \"2012-10-17\",' +
                '\"Statement\": [' +
                    '{' +
                        '\"Effect\": \"Allow\",' +
                        '\"Principal\": \"*\",' +
                        '\"Action\": \"sqs:SendMessage\",' +
                        '\"Resource\": \"' + queueArn + '\",' +
                        '\"Condition\": {' +
                            '\"ArnEquals\": {\"aws:SourceArn\": \"' + snsTopicArn + '\"}' +
                        '}' +
                    '}' +
                ']' +
            '}'
        },
        QueueUrl: queueUrl
    }).promise()
    .then(() => console.log("Successfully set queue policy for queue " + queueArn));

    let subscribePromise = sns.subscribe({
        Protocol: "sqs",
        TopicArn: snsTopicArn,
        Endpoint: queueArn,
        ReturnSubscriptionArn: true
    }).promise()
    .then(subscriptionData => sqsData["SubscriptionArn"] = subscriptionData.SubscriptionArn)
    .then(() => console.log("Subscribed queue " + queueArn + " to SNS with subscription " + sqsData.SubscriptionArn));

    return Promise.all([setPolicyPromise, subscribePromise]);
}