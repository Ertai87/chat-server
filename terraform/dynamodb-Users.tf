resource "aws_dynamodb_table" "dynamodb_table"{
  hash_key = "UserId"
  name = "Users"
  write_capacity = 5
  read_capacity = 5

  attribute {
    name = "UserId"
    type = "S"
  }
}