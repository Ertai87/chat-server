cd ../node
npm run zip
cd ../terraform/
terraform taint aws_lambda_function.lambda_receive_messages_function
terraform apply -auto-approve