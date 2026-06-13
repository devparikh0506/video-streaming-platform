# Terraform — LocalStack S3

Provisions the S3 bucket(s) used by StreamForge against
[LocalStack](https://localstack.cloud/). Applied with **`tflocal`**, a thin
wrapper around Terraform that auto-configures the AWS provider to talk to
LocalStack (endpoints, path-style addressing, dummy credentials).

## Prerequisites

1. LocalStack running (started by `docker compose up localstack`).
2. Terraform >= 1.6.
3. `tflocal` installed:

   ```bash
   pip install terraform-local
   ```

## Usage

Run from `infra/terraform/`:

```bash
tflocal init
tflocal plan
tflocal apply
```

`tflocal` proxies every command to `terraform`, so all normal flags work
(`tflocal apply -auto-approve`, `tflocal destroy`, etc.).

> If you run tflocal from inside the compose network instead of the host,
> set `localstack_endpoint = "http://localstack:4566"` and export
> `LOCALSTACK_HOST=localstack`.

## What it creates

| Resource | Purpose |
|----------|---------|
| `aws_s3_bucket.videos` | Raw uploads + transcoded DASH output |
| `aws_s3_bucket_versioning` | Guards against accidental overwrites |
| `aws_s3_bucket_cors_configuration` | Lets dash.js fetch segments with range requests |
| `aws_s3_bucket_public_access_block` | Keeps the bucket private |
| `aws_dynamodb_table.video_metadata` | Source-of-truth metadata per video |
| `aws_dynamodb_table.processing_jobs` | One item per transcode attempt |

### DynamoDB key design

**`video-metadata`** — unique-keyed item store:

| Key | Attribute | Type | Why |
|-----|-----------|------|-----|
| PK | `video_key` | S | uuid4 hex; single-item `GET /videos/{key}` |
| GSI `category-created_at-index` PK | `category` | S | browse by category |
| GSI ... SK | `created_at` | S (ISO 8601) | newest-first within a category |

> No base-table sort key on purpose — `video_key` is already unique, so a
> range key would be artificial. Sorted browse lives on the GSI.

**`processing-jobs`** — composite key (a video can have multiple attempts):

| Key | Attribute | Type | Why |
|-----|-----------|------|-----|
| PK | `video_key` | S | all jobs for a video |
| SK | `job_id` | S | a specific attempt |
| GSI `status-created_at-index` PK | `status` | S | find queued/processing/failed jobs |
| GSI ... SK | `created_at` | S (ISO 8601) | chronological within a status |

Both tables use `PAY_PER_REQUEST` (on-demand) billing — no capacity planning,
and fully supported by LocalStack. Non-key attributes (title, status, duration,
resolutions, error, …) are schemaless and not declared in Terraform.

## Verify

```bash
awslocal s3 ls
awslocal s3 ls s3://videos
awslocal dynamodb list-tables
```

## Outputs

- `videos_bucket_name` — bucket name for app config.
- `s3_endpoint` — endpoint apps should use to reach S3.

## Notes

- State is local (`terraform.tfstate`) and git-ignored — fine for ephemeral
  LocalStack dev. LocalStack state does not persist across `docker compose down`
  unless `PERSISTENCE=1` (already set in compose), so you may need to re-apply
  after a full teardown.
- `provider.tf` is intentionally minimal; do not add `endpoints {}` blocks —
  tflocal generates them.
