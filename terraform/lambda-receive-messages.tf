resource "aws_lambda_function" "lambda_receive_messages_function" {
  filename = "../node/lambda.zip"
  function_name = "ReceiveMessages"
  handler = "lambda-receiveMessages.handler"
  role = aws_iam_role.lambda_receive_messages_execution_role.arn
  runtime = "nodejs12.x"
  timeout = 60
}

resource "aws_iam_role" "lambda_receive_messages_execution_role" {
  assume_role_policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow"
    }
  ]
}
POLICY
}

resource "aws_iam_role_policy_attachment" "receive_messages_sqs_full_access" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonSQSFullAccess"
  role = aws_iam_role.lambda_receive_messages_execution_role.name
}

resource "aws_iam_role_policy_attachment" "receive_messages_dynamodb_full_access" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
  role = aws_iam_role.lambda_receive_messages_execution_role.name
}

resource "aws_iam_role_policy_attachment" "receive_messages_cloudwatch_logs" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role = aws_iam_role.lambda_receive_messages_execution_role.name
}