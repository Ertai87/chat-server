resource "aws_lambda_function" "lambda_function" {
  filename = "../node/lambda.zip"
  function_name = var.api_name
  handler = "lambda-${var.api_name}.handler"
  role = aws_iam_role.lambda_execution_role.arn
  runtime = "nodejs12.x"
}

resource "aws_iam_role" "lambda_execution_role" {
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

resource "aws_iam_role_policy_attachment" "cloudwatch_logs" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role = aws_iam_role.lambda_execution_role.name
}