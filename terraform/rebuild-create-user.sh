cd ../node
npm run zip
cd ../terraform/
terraform taint module.create_user.aws_lambda_function.lambda_function
terraform apply -auto-approve

