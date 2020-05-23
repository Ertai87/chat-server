cd ../node
npm run zip
cd ../terraform/
terraform taint module.receive_messages.aws_lambda_function.lambda_function
terraform apply -auto-approve
