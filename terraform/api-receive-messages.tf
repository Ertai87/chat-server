module "receive_messages" {
  source = "./modules/lambda-api"

  api_name = "ReceiveMessages"
  http_method = "GET"

  json_request_template = <<EOF
#set($inputRoot = $input.path('$'))
{
  "userId" : "$input.params('userId')"
}
EOF

  json_response_template = <<EOF
#set($inputRoot = $input.path('$'))
{
  "status":"200",
  "body":"$inputRoot.body"
}
EOF
}

resource "aws_iam_role_policy_attachment" "receive_messages_sqs_full_access" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonSQSFullAccess"
  role = module.receive_messages.lambda_execution_role_name
}

resource "aws_iam_role_policy_attachment" "receive_messages_dynamodb_full_access" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
  role = module.receive_messages.lambda_execution_role_name
}