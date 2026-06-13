# Minimal AWS provider. `tflocal` generates an override file at apply time
# (localstack_providers_override.tf) that injects the LocalStack endpoints,
# dummy credentials, and skip-validation flags. Do NOT hardcode endpoints here.
#
# s3_use_path_style is set explicitly: without it the provider uses
# virtual-hosted-style URLs (videos.s3.localhost.localstack.cloud) whose
# subdomain fails DNS resolution on Windows. Path-style -> http://host:4566/videos.
provider "aws" {
  region            = var.aws_region
  s3_use_path_style = true
}
