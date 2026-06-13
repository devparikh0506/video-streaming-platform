import re
import uuid

# video_key is a uuid4 hex string: 32 lowercase hex characters.
VIDEO_KEY_PATTERN = re.compile(r"^[0-9a-f]{32}$")

# DASH artifact filenames produced by ffmpeg, e.g. manifest.mpd,
# init-stream0.m4s, chunk-stream0-00001.m4s. No path separators allowed.
DASH_FILENAME_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")


def generate_video_key() -> str:
    """Generate a new server-side video key. Never derived from user input."""
    return uuid.uuid4().hex


def is_valid_video_key(value: str) -> bool:
    """Strict check used to validate any route parameter used as a key."""
    return VIDEO_KEY_PATTERN.fullmatch(value) is not None


def is_valid_dash_filename(value: str) -> bool:
    """Validate a DASH artifact filename — rejects path traversal and separators."""
    return ".." not in value and DASH_FILENAME_PATTERN.fullmatch(value) is not None
