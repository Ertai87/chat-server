const AWS = require('aws-sdk');
const sqs = new AWS.SQS();
const constants = require('./constants.js');
const privateConstants = require('./privateConstants.js'); //This file is not available in Github
const common = require('./common.js');

exports.handler = async (event, context, callback) => {
    if (!(event.userId)) {
        return callback("UserID not provided", null);
    }

    let userData = await common.userExists(event.userId)
        .then(data => data ? data : callback("User does not exist", null))

    var messageData;
    var messageList = [];
    do {
        messageData = await sqs.receiveMessage({
                QueueUrl: userData.QueueUrl.S,
                MaxNumberOfMessages: '1',
                MessageAttributeNames: ['ALL'],
                VisibilityTimeout: '10',
                WaitTimeSeconds: '1'
            }).promise();
        if (messageData.Messages){
            messageList.push(messageData);
        }
    }while (messageData.Messages);

    let deleteResponse = await sqs.deleteMessageBatch({
        Entries: messageList.map(message => {
            var deleteEntry = {
                Id: message.Messages[0].MessageId,
                ReceiptHandle: message.Messages[0].ReceiptHandle
            };
            return deleteEntry;
        }),
        QueueUrl: userData.QueueUrl.S
    }).promise();

    callback(null, {
        statusCode: 200,
        body: JSON.stringify(messageList.map(message => JSON.parse(message.Messages[0].Body).Message))
    });
}