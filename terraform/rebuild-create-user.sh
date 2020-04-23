cd ../node
npm run zip
cd ../terraform/
terraform taint aws_lambda_function.lambda_create_user_function
terraform apply -auto-approve

