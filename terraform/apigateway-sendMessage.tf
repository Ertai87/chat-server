resource "aws_api_gateway_rest_api" "send_message_api" {
  name = "SendMessageApi"
}

resource "aws_api_gateway_resource" "send_message_publish_resource" {
  path_part   = "publish"
  parent_id   = aws_api_gateway_rest_api.send_message_api.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.send_message_api.id
}

resource "aws_api_gateway_method" "send_message_publish_method" {
  rest_api_id   = aws_api_gateway_rest_api.send_message_api.id
  resource_id   = aws_api_gateway_resource.send_message_publish_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "send_message_integration" {
  rest_api_id             = aws_api_gateway_rest_api.send_message_api.id
  resource_id             = aws_api_gateway_resource.send_message_publish_resource.id
  http_method             = aws_api_gateway_method.send_message_publish_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.lambda_send_message_function.invoke_arn
}

resource "aws_lambda_permission" "send_message_apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_send_message_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${aws_api_gateway_rest_api.send_message_api.id}/*/${aws_api_gateway_method.send_message_publish_method.http_method}${aws_api_gateway_resource.send_message_publish_resource.path}"
}