resource "aws_dynamodb_table" "dynamodb_table"{
  hash_key = "UserId"
  range_key = "ActiveChatroom"
  name = "Users"
  write_capacity = 5
  read_capacity = 5

  attribute {
    name = "UserId"
    type = "S"
  }

  attribute {
    name = "ActiveChatroom"
    type = "S"
  }
}