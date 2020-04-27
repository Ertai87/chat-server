cd ../node
npm run zip
cd ../terraform/
terraform taint aws_lambda_function.lambda_send_message_function
terraform apply -auto-approve