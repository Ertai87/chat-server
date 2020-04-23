const AWS = require('aws-sdk');
const sqs = new AWS.SQS();
const dynamodb = new AWS.DynamoDB();
const sns = new AWS.SNS();
const constants = require('./constants.js');
const privateConstants = require('./privateConstants.js'); //This file is not available in Github

exports.handler = (event, context, callback) => {
    let snsTopicArn = "arn:aws:sns:" + constants.awsRegion + ":" + privateConstants.awsId + ":message-topic";
    var sqsData = {};

    let uniqueUserPromise = dynamodb.getItem({
        Key: {
            "UserId": {
                S: event.userId
            }
        },
        TableName: constants.userTableName
    }).promise()
    .then(data => data.Item != undefined ? callback("User already exists", null) : {});

    return uniqueUserPromise
        .then(() => {
            let dynamoPromise = dynamodb.putItem({
                Item: {
                    "UserId": {
                        S: event.userId
                    }
                },
                TableName: constants.userTableName
            }).promise()
            .then(data => console.log("Successfully wrote " + event.userId + " to DynamoDB"));

            let sqsPromise = sqs.createQueue({
                QueueName: event.userId
            }).promise()
            .then(createQueueData => {
                sqsData["QueueUrl"] = createQueueData.QueueUrl;
                return sqs.getQueueAttributes({
                    QueueUrl: sqsData.QueueUrl,
                    AttributeNames: ['QueueArn']
                }).promise()
            })
            .then(getQueueAttributesData => {
                sqsData["QueueArn"] = getQueueAttributesData.Attributes.QueueArn;

                let setPolicyPromise = sqs.setQueueAttributes({
                    Attributes: {
                        'Policy': '{\"Version\": \"2012-10-17\",\"Statement\": [{\"Effect\": \"Allow\",\"Principal\": \"*\",\"Action\": \"sqs:SendMessage\",\"Resource\": \"' + sqsData.QueueArn + '\",\"Condition\": {\"ArnEquals\": {\"aws:SourceArn\": \"' + snsTopicArn + '\"}}}]}',
                    },
                    QueueUrl: sqsData.QueueUrl
                }).promise()
                .then(() => console.log("Successfully set queue policy for queue " + sqsData.QueueArn));

                let subscribePromise = sns.subscribe({
                    Protocol: "sqs",
                    TopicArn: snsTopicArn,
                    Endpoint: sqsData.QueueArn,
                    ReturnSubscriptionArn: true
                }).promise()
                .then(subscriptionData => sqsData["SubscriptionArn"] = subscriptionData.SubscriptionArn)
                .then(() => console.log("Subscribed queue " + sqsData.QueueArn + " to SNS with subscription " + sqsData.SubscriptionArn));

                return Promise.all([setPolicyPromise, subscribePromise]);
            })
            .then(() => console.log("Successfully created SQS queue for " + event.userId + " with url " + sqsData.QueueUrl))

            return Promise.all([dynamoPromise, sqsPromise])
        })
        .then(() => callback(null, {
            statusCode: 200,
            body: ''
        }))
        .catch(err => {
            console.log("Error: " + err);

            let rollbackDynamoPromise = dynamodb.deleteItem({
                Key: {
                    "UserId": {
                        S: event.userId
                    }
                },
                TableName: constants.userTableName
            }).promise();

            let rollbackSqsPromise = sns.unsubscribe({
                SubscriptionArn: sqsData.SubscriptionArn
            }).promise()
            .catch(err => console.log("Subscription not created"))
            .then(() => sqs.deleteQueue({
                QueueUrl: sqsData.QueueUrl
            }).promise());

            console.log("Commencing rollback...");
            Promise.all([rollbackDynamoPromise, rollbackSqsPromise])
            .catch(err => console.log("Error in rolling back, check status"))
            .then(() => callback(err, null));
        });
}