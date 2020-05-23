module "send_message" {
  source = "./modules/lambda-api"

  api_name = "SendMessage"
  http_method = "POST"

  json_request_template = <<EOF
#set($inputRoot = $input.path('$'))
{
  "userId" : "$input.path('userId')",
  "message": "$input.path('message')"
}
EOF
}

resource "aws_iam_role_policy_attachment" "send_message_sns_full_access" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonSNSFullAccess"
  role = module.send_message.lambda_execution_role_name
}

resource "aws_iam_role_policy_attachment" "send_message_dynamodb_full_access" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
  role = module.send_message.lambda_execution_role_name
}