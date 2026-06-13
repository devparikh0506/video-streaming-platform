variable "aws_region" {
  description = "AWS region (LocalStack ignores this but the provider requires it)."
  type        = string
  default     = "us-east-1"
}

variable "localstack_endpoint" {
  description = "LocalStack edge endpoint, exposed as an output for apps. tflocal manages the provider endpoints itself."
  type        = string
  default     = "http://localhost:4566"
}

variable "videos_bucket_name" {
  description = "Name of the S3 bucket that stores raw uploads and DASH output."
  type        = string
  default     = "videos"
}

variable "cors_allowed_origins" {
  description = "Origins allowed to read objects directly from the bucket (e.g. the frontend dev server)."
  type        = list(string)
  default     = ["http://localhost:5173"]
}

variable "videos_table_name" {
  description = "DynamoDB table holding the source-of-truth metadata per video."
  type        = string
  default     = "video-metadata"
}
