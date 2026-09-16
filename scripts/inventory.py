"""Inventory script for Helsinki Python MOOC 2026.
Scans the entire cloned repository and especially data/ to generate reports/inventory.json.
"""

import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Set

# Ensure parent directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from scripts.utils import (
    CODE_BLOCK_REGEX,
    FRONTMATTER_REGEX,
    compute_file_sha256,
    parse_frontmatter,
    safe_read_text,
    safe_write_json,
)

BASE_DIR = Path(__file__).resolve().parent.parent
SOURCE_DIR = BASE_DIR / "source" / "programming-26"
DATA_DIR = SOURCE_DIR / "data"
REPORTS_DIR = BASE_DIR / "reports"

CUSTOM_TAG_REGEX = re.compile(r"<([a-zA-Z0-9_-]+)(?:\s+[^>]*)?>")
MD_LINK_REGEX = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
HTML_SRC_REGEX = re.compile(r'src=["\']([^"\']+)["\']', re.IGNORECASE)
EXERCISE_REGEX = re.compile(r"<\s*(programming-exercise|in-browser-programming-exercise)\s+([^>]*)>", re.DOTALL)
QUIZ_REGEX = re.compile(r'<\s*quiz\s+id=["\']([^"\']+)["\']', re.DOTALL)
HEADING_REGEX = re.compile(r"^(#{1,6})\s+(.*)$", re.MULTILINE)

# Known Gatsby custom components registered in src/partials
KNOWN_COMPONENTS = {
    "programming-exercise",
    "in-browser-programming-exercise",
    "sample-output",
    "sample-data",
    "text-box",
    "quiz",
    "quiznator",
    "pages-in-this-section",
    "exercises-in-this-section",
    "exercises-in-all-sections",
    "notice",
    "deadline",
    "summary",
    "table-of-contents",
    "vocabulary",
    "vocabulary-word",
    "code-states-visualizer",
    "pdf-slideshow",
    "ab-study",
    "only-for-ab-group",
    "only-for-course-variant",
    "only-for-not-logged-in",
    "please-login",
    "youtube",
    "moodle-exercise",
    "sqltrainer-exercise",
    "google-form-link",
    "workshop-schedule",
}


def categorize_file(rel_path: str) -> str:
    norm = rel_path.replace("\\", "/")
    ext = os.path.splitext(norm)[1].lower()

    if norm.startswith("data/"):
        parts = norm.split("/")
        if len(parts) > 2 and parts[1].startswith("part-"):
            if parts[-1] == "index.md":
                return "course_part_index"
            elif ext == ".md":
                return "course_lesson_markdown"
            elif ext in [".png", ".jpg", ".jpeg", ".gif", ".ora", ".svg"]:
                return "course_asset_image"
            elif ext in [".wav", ".mp3"]:
                return "course_asset_audio"
            elif ext == ".py":
                return "course_source_code"
            else:
                return "course_part_asset"
        else:
            if ext == ".md" or ext == ".old":
                return "course_root_page"
            elif ext in [".png", ".jpg", ".jpeg", ".gif", ".ora", ".svg"]:
                return "course_asset_image"
            else:
                return "course_asset_other"
    elif norm.startswith("src/"):
        return "platform_source"
    elif norm.startswith("plugins/"):
        return "platform_plugin"
    elif norm.startswith("static/"):
        return "platform_static"
    elif norm.startswith(".github/"):
        return "platform_ci_config"
    elif norm in ["package.json", "package-lock.json", "gatsby-config.js", "gatsby-node.js", "course-settings.js", "course-metadata.json"]:
        return "platform_configuration"
    elif ext in [".md", ".txt"]:
        return "platform_documentation"
    else:
        return "platform_misc"


def scan_file_details(full_path: Path, rel_path: str) -> Dict[str, Any]:
    norm_path = rel_path.replace("\\", "/")
    ext = full_path.suffix.lower()
    size = full_path.stat().st_size
    sha256 = compute_file_sha256(str(full_path))
    category = categorize_file(norm_path)

    references = []
    metadata = {}

    if ext in [".md", ".old"]:
        content = safe_read_text(str(full_path))
        fm, body = parse_frontmatter(content)
        metadata["frontmatter"] = fm

        # Links
        links = []
        for m in MD_LINK_REGEX.finditer(body):
            links.append({"text": m.group(1), "url": m.group(2)})
        metadata["links_count"] = len(links)
        metadata["links"] = links
        for l in links:
            references.append({"type": "markdown_link", "target": l["url"]})

        # Images (HTML and Markdown)
        img_refs = []
        for m in HTML_SRC_REGEX.finditer(body):
            src = m.group(1)
            img_refs.append(src)
            references.append({"type": "image_src", "target": src})
        for m in re.finditer(r"!\[(.*?)\]\((.*?)\)", body):
            src = m.group(2)
            img_refs.append(src)
            references.append({"type": "markdown_image", "target": src})
        metadata["images"] = list(set(img_refs))

        # Code blocks
        code_blocks = []
        for m in CODE_BLOCK_REGEX.finditer(body):
            lang = m.group(1) or "unspecified"
            code_blocks.append({"lang": lang, "length": len(m.group(2))})
        metadata["code_blocks_count"] = len(code_blocks)
        metadata["code_blocks"] = code_blocks

        # Custom components
        found_components = set()
        for m in CUSTOM_TAG_REGEX.finditer(body):
            tag = m.group(1)
            if tag in KNOWN_COMPONENTS:
                found_components.add(tag)
        metadata["custom_components"] = sorted(list(found_components))

        # Exercises & Quizzes
        ex_list = []
        for m in EXERCISE_REGEX.finditer(body):
            ex_list.append({"type": m.group(1), "attrs": m.group(2).strip()})
        metadata["exercises"] = ex_list

        quizzes = []
        for m in QUIZ_REGEX.finditer(body):
            quizzes.append(m.group(1))
        metadata["quizzes"] = quizzes

        # Headings
        headings = []
        for m in HEADING_REGEX.finditer(body):
            headings.append({"level": len(m.group(1)), "title": m.group(2).strip()})
        metadata["headings"] = headings

    return {
        "path": norm_path,
        "extension": ext,
        "size": size,
        "sha256": sha256,
        "category": category,
        "references": references,
        "metadata": metadata,
    }


def run_inventory() -> Dict[str, Any]:
    print(f"Scanning repository at: {SOURCE_DIR}")
    if not SOURCE_DIR.exists():
        raise FileNotFoundError(f"Source repository directory not found: {SOURCE_DIR}")

    files_data = []
    course_files = []
    total_parts_set = set()
    total_lessons = 0
    total_exercises = 0
    total_code_blocks = 0
    total_images_in_md = 0
    total_links = 0
    total_custom_components_count = 0

    for root, dirs, fnames in os.walk(SOURCE_DIR):
        # Skip git directory
        if ".git" in dirs:
            dirs.remove(".git")
        for fname in fnames:
            full_path = Path(root) / fname
            rel_path = full_path.relative_to(SOURCE_DIR).as_posix()
            item = scan_file_details(full_path, rel_path)
            files_data.append(item)

            if rel_path.startswith("data/"):
                course_files.append(item)
                if "/" in rel_path:
                    top_part = rel_path.split("/")[1]
                    if top_part.startswith("part-"):
                        total_parts_set.add(top_part)

                if item["category"] == "course_lesson_markdown":
                    total_lessons += 1

                meta = item.get("metadata", {})
                total_exercises += len(meta.get("exercises", []))
                total_code_blocks += meta.get("code_blocks_count", 0)
                total_images_in_md += len(meta.get("images", []))
                total_links += meta.get("links_count", 0)
                total_custom_components_count += len(meta.get("custom_components", []))

    summary = {
        "total_files": len(files_data),
        "total_course_files": len(course_files),
        "total_parts": len(total_parts_set),
        "parts_list": sorted(list(total_parts_set), key=lambda x: int(x.split("-")[1])),
        "total_lessons": total_lessons,
        "total_exercises": total_exercises,
        "total_code_blocks": total_code_blocks,
        "total_images_in_markdown": total_images_in_md,
        "total_links": total_links,
        "total_custom_components": total_custom_components_count,
    }

    report = {
        "summary": summary,
        "files": files_data,
    }

    out_file = REPORTS_DIR / "inventory.json"
    safe_write_json(str(out_file), report)
    print(f"Inventory completed. Saved report to: {out_file}")
    print("\n--- INVENTORY SUMMARY ---")
    for k, v in summary.items():
        print(f"{k.upper()}: {v}")

    return report


if __name__ == "__main__":
    run_inventory()
