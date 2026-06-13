# --------------------------------------------------------------------------
# video-metadata: source of truth for each uploaded video.
#
# Base key:
#   PK = video_key   (uuid4 hex; unique per video -> single-item GET)
# A sort key on the base table is intentionally omitted: video_key already
# uniquely identifies the item, so a base-table range key would be artificial.
#
# Browse access patterns, both newest-first, served by GSIs:
#   GSI category-created_at-index:   PK = category,    SK = created_at  (by category)
#   GSI visibility-created_at-index: PK = visibility,  SK = created_at  (all visible)
#
# visibility ("active" | "inactive") partitions the catalog so it can be Queried
# (and thus sorted by created_at) — a Scan cannot sort. It doubles as a soft-delete
# flag: flipping a video to "inactive" re-indexes it out of the active feed without
# deleting the row. The active partition is the hot one; fine at MVP scale.
#
# Non-key attributes (title, status, duration, resolutions, error, ...) are
# schemaless and must NOT be declared here.
# --------------------------------------------------------------------------
resource "aws_dynamodb_table" "video_metadata" {
  name         = var.videos_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "video_key"

  attribute {
    name = "video_key"
    type = "S"
  }

  attribute {
    name = "category"
    type = "S"
  }

  attribute {
    name = "created_at"
    type = "S"
  }

  attribute {
    name = "visibility"
    type = "S"
  }

  global_secondary_index {
    name            = "category-created_at-index"
    hash_key        = "category"
    range_key       = "created_at"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "visibility-created_at-index"
    hash_key        = "visibility"
    range_key       = "created_at"
    projection_type = "ALL"
  }
}
