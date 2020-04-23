const aws = require('aws-sdk')
const constants = require('./constants.js')

exports.handler = (event, context, callback) => {
    new aws.DynamoDB().scan({
        ExpressionAttributeNames: {
            "userId": "UserId"
        },
        ExpressionAttributeValues: {
            ":user": { S: event.userId }
        },
        FilterExpression: "UserId <> :user",
        ProjectionExpression: "userId",
        TableName: constants.userTableName
    }).promise()

    .then(userList => userList
        .map(user => new aws.SNS({apiVersion: '2010-03-31'})
        .publish({
            Message: event.message,
            TopicArn: "arn:aws:sns:us-east-1:641609470517:message-topic"
        })
        .promise())
        .all()
    )

    .then(data => console.log("Successfully published message '" + event.message + "'to server"))
    .then(() => callback(null, {
        statusCode: 200,
        body: ''
    }))
    .catch(err => console.log("Error: " + err));
}