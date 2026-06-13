# Primary bucket for raw uploads and transcoded DASH segments/manifests.
resource "aws_s3_bucket" "videos" {
  bucket = var.videos_bucket_name
}

# Versioning protects against accidental overwrites of manifests/segments.
resource "aws_s3_bucket_versioning" "videos" {
  bucket = aws_s3_bucket.videos.id

  versioning_configuration {
    status = "Enabled"
  }
}

# CORS for direct browser <-> S3 traffic:
#   - PUT: the browser uploads multipart parts straight to S3 via presigned URLs.
#   - GET/HEAD: range reads (dash.js segments, resumable-upload checks).
# ETag MUST be exposed so the client can read each part's ETag for CompleteUpload;
# Content-Range / Accept-Ranges let the player seek.
resource "aws_s3_bucket_cors_configuration" "videos" {
  bucket = aws_s3_bucket.videos.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD", "PUT"]
    allowed_origins = var.cors_allowed_origins
    expose_headers  = ["ETag", "Content-Range", "Accept-Ranges", "Content-Length"]
    max_age_seconds = 3000
  }
}

# Keep the bucket private; objects are reached via the app or presigned URLs.
resource "aws_s3_bucket_public_access_block" "videos" {
  bucket = aws_s3_bucket.videos.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
