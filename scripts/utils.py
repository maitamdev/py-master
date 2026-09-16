"""Shared utility functions for Helsinki Python MOOC 2026 Localization Pipeline.
"""

import hashlib
import json
import os
import re
from typing import Any, Dict, List, Optional, Tuple

import yaml

# Standard regex patterns
FRONTMATTER_REGEX = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)
CODE_BLOCK_REGEX = re.compile(r"```([a-zA-Z0-9_-]*)\n(.*?)\n```", re.DOTALL)
INLINE_CODE_REGEX = re.compile(r"`([^`]+)`")
IMAGE_MD_REGEX = re.compile(r"!\[(.*?)\]\((.*?)\)")
IMAGE_HTML_REGEX = re.compile(r'<img\s+([^>]*?)src=["\'](.*?)["\']([^>]*?)>', re.IGNORECASE)


def compute_sha256(content: str) -> str:
    """Compute hex SHA256 of text with normalized newlines."""
    # Normalize CRLF to LF for deterministic hashes across platforms
    normalized = content.replace("\r\n", "\n")
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def compute_file_sha256(filepath: str) -> str:
    """Compute hex SHA256 of a file on disk."""
    hasher = hashlib.sha256()
    with open(filepath, "rb") as fp:
        while chunk := fp.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def safe_read_text(filepath: str) -> str:
    """Safely read text file with UTF-8 encoding."""
    with open(filepath, "r", encoding="utf-8", errors="replace") as fp:
        return fp.read()


def safe_write_json(filepath: str, data: Any, indent: int = 2) -> None:
    """Write JSON file ensuring valid UTF-8 and formatting."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as fp:
        json.dump(data, fp, ensure_ascii=False, indent=indent)


def safe_read_json(filepath: str) -> Any:
    """Safely load JSON file with UTF-8 encoding."""
    with open(filepath, "r", encoding="utf-8") as fp:
        return json.load(fp)


def parse_frontmatter(content: str) -> Tuple[Dict[str, Any], str]:
    """Extract frontmatter and remaining body from Markdown content."""
    match = FRONTMATTER_REGEX.match(content)
    if match:
        fm_text = match.group(1)
        body = content[match.end():]
        try:
            fm = yaml.safe_load(fm_text) or {}
        except Exception:
            fm = {}
        return fm, body
    return {}, content


def check_python_syntax(code: str) -> Tuple[bool, str]:
    """Test if Python code snippet can be compiled.
    Returns (is_valid, error_or_reason).
    """
    code_normalized = code.strip()
    if not code_normalized:
        return True, "empty_code"

    try:
        compile(code, "<string>", "exec")
        return True, "valid_syntax"
    except SyntaxError as e:
        # Check if it is an incomplete snippet (e.g., ellipses, prompt prefix, or placeholder)
        if "..." in code or ">>>" in code or "<" in code:
            return True, f"snippet_partial_syntax ({e})"
        return False, f"SyntaxError: {e}"
    except Exception as e:
        return False, f"Error: {e}"


def check_mojibake(text: str) -> bool:
    """Detect common mojibake encoding corruption patterns."""
    mojibake_signatures = [
        "tiáº", "Viá»", "l?p tr?nh", "Ã¡", "Ã ", "Ã£", "Ã©", "Ã¨", "Ãª",
        "Ã­", "Ã³", "Ã²", "Ã´", "Ãµ", "Ãº", "Ã¹", "Ä‘", "â€", "ï¿½"
    ]
    for sig in mojibake_signatures:
        if sig in text:
            return True
    return False


def ensure_dirs(*dirs: str) -> None:
    """Create directories if they do not exist."""
    for d in dirs:
        os.makedirs(d, exist_ok=True)
