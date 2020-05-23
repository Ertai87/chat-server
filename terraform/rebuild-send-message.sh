cd ../node
npm run zip
cd ../terraform/
terraform taint module.send_message.aws_lambda_function.lambda_function
terraform apply -auto-approve
