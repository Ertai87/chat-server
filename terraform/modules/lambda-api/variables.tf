variable "api_name" {
  description = "Name of the API in API Gateway"
}

variable "http_method" {
  description = "HTTP method for accessing this API"
}

variable "json_request_template" {
  description = "Template for mapping the integration request to JSON"
}

variable "json_response_template" {
  description = "Response template for mapping the integration response to JSON"
  default = <<EOF
#set($inputRoot = $input.path('$'))
{
  "status":"200",
  "message":"OK"
}
EOF
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}