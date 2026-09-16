"""Extraction script for Helsinki Python MOOC 2026.
Parses markdown files and copies assets with provenance tracking.
"""

import os
import re
import shutil
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from scripts.utils import (
    CODE_BLOCK_REGEX,
    FRONTMATTER_REGEX,
    compute_file_sha256,
    compute_sha256,
    ensure_dirs,
    parse_frontmatter,
    safe_read_text,
    safe_write_json,
)

BASE_DIR = Path(__file__).resolve().parent.parent
SOURCE_DIR = BASE_DIR / "source" / "programming-26"
DATA_DIR = SOURCE_DIR / "data"
RAW_DIR = BASE_DIR / "data" / "raw"
ASSETS_DIR = BASE_DIR / "assets"

ensure_dirs(
    str(RAW_DIR / "lessons"),
    str(RAW_DIR / "pages"),
    str(RAW_DIR / "parts"),
    str(ASSETS_DIR / "images"),
    str(ASSETS_DIR / "diagrams"),
    str(ASSETS_DIR / "other"),
)


def extract_assets() -> Dict[str, Any]:
    """Copy all media assets from source to assets/ with provenance records."""
    print("Extracting assets with provenance...")
    provenance = {}
    asset_extensions = {
        ".png": "images",
        ".jpg": "images",
        ".jpeg": "images",
        ".gif": "images",
        ".svg": "images",
        ".ora": "diagrams",
        ".wav": "other",
        ".mp3": "other",
        ".py": "other",
    }

    count = 0
    for root, _, fnames in os.walk(DATA_DIR):
        for fname in fnames:
            ext = os.path.splitext(fname)[1].lower()
            if ext in asset_extensions:
                src_path = Path(root) / fname
                rel_src = src_path.relative_to(DATA_DIR).as_posix()
                subfolder = asset_extensions[ext]

                # Maintain relative path structure inside subfolder
                dest_path = ASSETS_DIR / subfolder / rel_src
                dest_path.parent.mkdir(parents=True, exist_ok=True)

                shutil.copy2(src_path, dest_path)
                sha = compute_file_sha256(str(dest_path))

                provenance[rel_src] = {
                    "original_path": f"data/{rel_src}",
                    "local_path": f"assets/{subfolder}/{rel_src}",
                    "sha256": sha,
                    "size_bytes": dest_path.stat().st_size,
                    "media_type": subfolder,
                }
                count += 1

    prov_file = ASSETS_DIR / "provenance.json"
    safe_write_json(str(prov_file), provenance)
    print(f"Copied {count} assets. Saved provenance to {prov_file}")
    return provenance


def parse_attributes(attr_str: str) -> Dict[str, str]:
    """Parse HTML/JSX tag attributes string into dict."""
    attrs = {}
    pattern = re.compile(r'([a-zA-Z0-9_-]+)\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s>]+))')
    for m in pattern.finditer(attr_str):
        key = m.group(1)
        val = m.group(2) if m.group(2) is not None else (m.group(3) if m.group(3) is not None else m.group(4))
        attrs[key] = val
    return attrs


def extract_content_chunks(markdown_text: str) -> List[Dict[str, Any]]:
    """Splits markdown text into typed raw chunks preserving full content."""
    chunks = []
    text = markdown_text

    # Regex patterns for top-level constructs
    # 1. Custom container tags
    CONTAINER_TAGS = [
        "programming-exercise",
        "in-browser-programming-exercise",
        "sample-output",
        "sample-data",
        "text-box",
        "notice",
        "summary",
        "moodle-exercise",
        "sqltrainer-exercise",
        "youtube",
        "quiz",
        "pages-in-this-section",
        "exercises-in-this-section",
        "exercises-in-all-sections",
        "table-of-contents",
        "vocabulary",
        "deadline",
    ]

    tag_union = "|".join(CONTAINER_TAGS)
    block_pattern = re.compile(
        rf"(?P<code>```[a-zA-Z0-9_-]*[^\S\r\n]*\r?\n.*?\n[^\S\r\n]*```)|"
        rf"(?P<container><\s*(?P<tag>{tag_union})(?:\s+(?P<attrs>[^>]*))?\s*>(?P<inner>.*?)</\s*(?P=tag)s?\s*>)|"
        rf"(?P<self_closing><\s*(?P<stag>{tag_union})(?:\s+(?P<sattrs>[^/>]*))?\s*/?>)|"
        rf"(?P<html_img><img\s+[^>]*>)",
        re.DOTALL | re.IGNORECASE,
    )

    last_idx = 0

    def add_text_subchunks(subtext: str):
        """Splits intermediate markdown text into paragraphs, headings, lists, tables."""
        nonlocal chunks
        clean = subtext.strip()
        if not clean:
            return

        # Split on double newlines for paragraphs / headings / lists / tables
        parts = re.split(r"\n\s*\n", clean)
        for part in parts:
            part_str = part.strip()
            if not part_str:
                continue

            # Heading
            h_match = re.match(r"^(#{1,6})\s+(.*)$", part_str, re.DOTALL)
            if h_match and "\n" not in part_str:
                level = len(h_match.group(1))
                chunks.append({
                    "raw_type": "heading",
                    "level": level,
                    "content": h_match.group(2).strip(),
                    "raw_source": part_str,
                })
            elif part_str.startswith("|") and "|" in part_str.splitlines()[0]:
                chunks.append({
                    "raw_type": "table",
                    "content": part_str,
                    "raw_source": part_str,
                })
            elif part_str.startswith(">"):
                chunks.append({
                    "raw_type": "quote",
                    "content": part_str,
                    "raw_source": part_str,
                })
            elif re.match(r"^(\*|-|\+|\d+\.)\s+", part_str):
                chunks.append({
                    "raw_type": "list",
                    "content": part_str,
                    "raw_source": part_str,
                })
            else:
                chunks.append({
                    "raw_type": "paragraph",
                    "content": part_str,
                    "raw_source": part_str,
                })

    for match in block_pattern.finditer(text):
        start, end = match.span()
        # Process preceding plain text
        if start > last_idx:
            add_text_subchunks(text[last_idx:start])

        if match.group("code"):
            code_str = match.group("code")
            code_m = re.match(r"```([a-zA-Z0-9_-]*)\n(.*?)\n```", code_str, re.DOTALL)
            lang = code_m.group(1) if code_m else ""
            code_body = code_m.group(2) if code_m else ""
            chunks.append({
                "raw_type": "code",
                "language": lang,
                "code": code_body,
                "raw_source": code_str,
            })
        elif match.group("container"):
            tag = match.group("tag").lower()
            attrs_str = match.group("attrs") or ""
            inner = match.group("inner") or ""
            attrs = parse_attributes(attrs_str)
            chunks.append({
                "raw_type": "custom_container",
                "component_name": tag,
                "attributes": attrs,
                "inner_content": inner.strip(),
                "raw_source": match.group("container"),
            })
        elif match.group("self_closing"):
            stag = match.group("stag").lower()
            sattrs_str = match.group("sattrs") or ""
            attrs = parse_attributes(sattrs_str)
            chunks.append({
                "raw_type": "custom_self_closing",
                "component_name": stag,
                "attributes": attrs,
                "raw_source": match.group("self_closing"),
            })
        elif match.group("html_img"):
            img_str = match.group("html_img")
            attrs = parse_attributes(img_str)
            chunks.append({
                "raw_type": "image",
                "attributes": attrs,
                "raw_source": img_str,
            })

        last_idx = end

    # Remaining text
    if last_idx < len(text):
        add_text_subchunks(text[last_idx:])

    return chunks


def extract_all() -> Dict[str, Any]:
    extract_assets()

    md_files = sorted(DATA_DIR.glob("**/*.md"))
    print(f"Extracting {len(md_files)} markdown files...")

    extracted_lessons = []
    extracted_pages = []

    for md_path in md_files:
        rel_path = md_path.relative_to(DATA_DIR).as_posix()
        content = safe_read_text(str(md_path))
        file_hash = compute_sha256(content)
        fm, body = parse_frontmatter(content)
        chunks = extract_content_chunks(body)

        parts = rel_path.split("/")
        is_in_part = len(parts) > 1 and parts[0].startswith("part-")

        if is_in_part:
            part_num = int(parts[0].replace("part-", ""))
            is_index = parts[1] == "index.md"
            slug = parts[1].replace(".md", "")
            lesson_id = f"part{part_num:02d}-{slug}"

            record = {
                "id": lesson_id,
                "part": part_num,
                "part_slug": parts[0],
                "slug": slug,
                "is_part_index": is_index,
                "title_original": fm.get("title", slug),
                "path": fm.get("path", f"/{parts[0]}/{slug}"),
                "source_path": f"data/{rel_path}",
                "source_hash": file_hash,
                "frontmatter": fm,
                "chunks_count": len(chunks),
                "raw_chunks": chunks,
            }
            extracted_lessons.append(record)
            out_file = RAW_DIR / "lessons" / f"{lesson_id}.json"
            safe_write_json(str(out_file), record)
        else:
            page_slug = parts[0].replace(".md", "")
            page_id = f"page-{page_slug}"

            record = {
                "id": page_id,
                "slug": page_slug,
                "title_original": fm.get("title", page_slug),
                "path": fm.get("path", f"/{page_slug}"),
                "source_path": f"data/{rel_path}",
                "source_hash": file_hash,
                "frontmatter": fm,
                "chunks_count": len(chunks),
                "raw_chunks": chunks,
            }
            extracted_pages.append(record)
            out_file = RAW_DIR / "pages" / f"{page_id}.json"
            safe_write_json(str(out_file), record)

    print(f"Extraction complete: {len(extracted_lessons)} part lessons/indexes, {len(extracted_pages)} root pages.")
    return {
        "lessons_count": len(extracted_lessons),
        "pages_count": len(extracted_pages),
        "total": len(extracted_lessons) + len(extracted_pages),
    }


if __name__ == "__main__":
    extract_all()
