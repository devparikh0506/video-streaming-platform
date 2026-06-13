"""Predefined category catalog.

Categories are a fixed, ops-curated enumeration loaded from a JSON file (see
``settings.categories_file``) — not free text and not derived from stored data.
The loaded set is the single source of truth for both upload validation and the
categories listing endpoint.

The result is cached; editing the file requires an app restart to take effect.
"""

import json
from functools import lru_cache
from pathlib import Path

from app.core.config import get_settings


@lru_cache
def get_allowed_categories() -> tuple[str, ...]:
    """Load and validate the category catalog. Fails fast if malformed."""
    path = Path(get_settings().categories_file)
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise RuntimeError(f"Category catalog not found: {path}") from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Category catalog is not valid JSON: {path}") from exc

    if not isinstance(raw, list) or not raw:
        raise RuntimeError(f"Category catalog must be a non-empty JSON array: {path}")
    if not all(isinstance(c, str) and c.strip() for c in raw):
        raise RuntimeError(f"Category catalog must contain non-empty strings: {path}")

    return tuple(raw)


def is_valid_category(value: str) -> bool:
    return value in get_allowed_categories()
