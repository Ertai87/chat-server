module "create_user" {
  source = "./modules/lambda-api"

  api_name = "CreateUser"
  http_method = "POST"

  json_request_template = <<EOF
#set($inputRoot = $input.path('$'))
{
  "userId" : "$input.path('userId')"
}
EOF

}

resource "aws_iam_role_policy_attachment" "create_user_sqs_full_access" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonSQSFullAccess"
  role = module.create_user.lambda_execution_role_name
}

resource "aws_iam_role_policy_attachment" "create_user_dynamodb_full_access" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
  role = module.create_user.lambda_execution_role_name
}