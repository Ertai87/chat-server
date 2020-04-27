resource "aws_api_gateway_rest_api" "create_user_api" {
  name = "CreateUserApi"
}

resource "aws_api_gateway_resource" "create_user_publish_resource" {
  path_part   = "publish"
  parent_id   = aws_api_gateway_rest_api.create_user_api.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.create_user_api.id
}

resource "aws_api_gateway_method" "create_user_publish_method" {
  rest_api_id   = aws_api_gateway_rest_api.create_user_api.id
  resource_id   = aws_api_gateway_resource.create_user_publish_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "create_user_integration" {
  rest_api_id             = aws_api_gateway_rest_api.create_user_api.id
  resource_id             = aws_api_gateway_resource.create_user_publish_resource.id
  http_method             = aws_api_gateway_method.create_user_publish_method.http_method
  integration_http_method = "POST"
  type                    = "AWS"
  uri                     = aws_lambda_function.lambda_create_user_function.invoke_arn

  request_templates = {
    "application/json" = <<EOF
#set($inputRoot = $input.path('$'))
{
  "userId" : "$input.path('userId')"
}
EOF
  }
}

resource "aws_lambda_permission" "create_user_apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_create_user_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.create_user_api.id}/*/${aws_api_gateway_method.create_user_publish_method.http_method}${aws_api_gateway_resource.create_user_publish_resource.path}"
}

resource "aws_api_gateway_model" "create_user_request_model" {
  rest_api_id  = aws_api_gateway_rest_api.create_user_api.id
  name         = "createUserRequestModel"
  content_type = "application/json"

  schema = <<EOF
{
    "type":"object",
    "properties":{
        "userId":{"type":"string"}
    },
    "title":"createUserRequestModel"
}
EOF
}