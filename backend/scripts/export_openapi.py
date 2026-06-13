"""Export the OpenAPI contract for the frontend team.

Writes ``openapi.json`` and ``openapi.yaml`` next to the backend root.

Run from the backend/ directory:
    python scripts/export_openapi.py

Generating the schema imports the app, which loads Settings. Dummy AWS values
are injected so it runs without real credentials — no AWS calls are made during
schema generation.
"""

import json
import os
import sys
from pathlib import Path

# Make the backend root importable regardless of the caller's CWD.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ.setdefault("AWS_ACCESS_KEY_ID", "dummy")
os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "dummy")

import yaml  # noqa: E402

from app.main import app  # noqa: E402


def main() -> None:
    spec = app.openapi()
    root = Path(__file__).resolve().parent.parent

    json_path = root / "openapi.json"
    json_path.write_text(json.dumps(spec, indent=2), encoding="utf-8")

    yaml_path = root / "openapi.yaml"
    yaml_path.write_text(yaml.safe_dump(spec, sort_keys=False), encoding="utf-8")

    print(f"Wrote {json_path}")
    print(f"Wrote {yaml_path}")


if __name__ == "__main__":
    main()
