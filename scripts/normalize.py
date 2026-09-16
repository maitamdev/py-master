"""Normalization script for Helsinki Python MOOC 2026.
Transforms raw extracted data into standardized content blocks, exercises, and parts schemas.
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from scripts.utils import (
    CODE_BLOCK_REGEX,
    compute_sha256,
    ensure_dirs,
    safe_read_json,
    safe_write_json,
)

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / "data" / "raw"
NORMALIZED_DIR = BASE_DIR / "data" / "normalized"
MANIFESTS_DIR = BASE_DIR / "data" / "manifests"

ensure_dirs(
    str(NORMALIZED_DIR / "lessons"),
    str(NORMALIZED_DIR / "pages"),
    str(NORMALIZED_DIR / "parts"),
    str(NORMALIZED_DIR / "exercises"),
    str(MANIFESTS_DIR),
)


def normalize_chunk(chunk: Dict[str, Any], block_id: str, order: int, lesson_id: str, part_num: Optional[int]) -> Tuple[Dict[str, Any], Optional[Dict[str, Any]]]:
    """Converts a raw chunk into a standard content block and extracts exercise if applicable."""
    raw_type = chunk.get("raw_type")
    extracted_exercise = None

    if raw_type == "code":
        code_str = chunk.get("code", "")
        code_hash = compute_sha256(code_str)
        lang = chunk.get("language", "")
        block = {
            "id": block_id,
            "type": "code",
            "order": order,
            "source_hash": code_hash,
            "translation_status": "not_applicable",
            "original": {
                "language": "code",
                "content": code_str,
            },
            "translation": {
                "language": "code",
                "content": code_str,
            },
            "metadata": {
                "language": lang,
                "code_hash": code_hash,
                "length_lines": len(code_str.splitlines()),
            },
        }

    elif raw_type == "heading":
        content = chunk.get("content", "")
        h_hash = compute_sha256(content)
        block = {
            "id": block_id,
            "type": "heading",
            "order": order,
            "source_hash": h_hash,
            "translation_status": "pending",
            "original": {
                "language": "en",
                "content": content,
            },
            "translation": {
                "language": "vi",
                "content": "",
            },
            "metadata": {
                "level": chunk.get("level", 2),
            },
        }

    elif raw_type == "paragraph":
        content = chunk.get("content", "")
        p_hash = compute_sha256(content)
        block = {
            "id": block_id,
            "type": "paragraph",
            "order": order,
            "source_hash": p_hash,
            "translation_status": "pending",
            "original": {
                "language": "en",
                "content": content,
            },
            "translation": {
                "language": "vi",
                "content": "",
            },
            "metadata": {},
        }

    elif raw_type == "list":
        content = chunk.get("content", "")
        l_hash = compute_sha256(content)
        block = {
            "id": block_id,
            "type": "list",
            "order": order,
            "source_hash": l_hash,
            "translation_status": "pending",
            "original": {
                "language": "en",
                "content": content,
            },
            "translation": {
                "language": "vi",
                "content": "",
            },
            "metadata": {},
        }

    elif raw_type == "table":
        content = chunk.get("content", "")
        t_hash = compute_sha256(content)
        block = {
            "id": block_id,
            "type": "table",
            "order": order,
            "source_hash": t_hash,
            "translation_status": "pending",
            "original": {
                "language": "en",
                "content": content,
            },
            "translation": {
                "language": "vi",
                "content": "",
            },
            "metadata": {},
        }

    elif raw_type == "quote":
        content = chunk.get("content", "")
        q_hash = compute_sha256(content)
        block = {
            "id": block_id,
            "type": "quote",
            "order": order,
            "source_hash": q_hash,
            "translation_status": "pending",
            "original": {
                "language": "en",
                "content": content,
            },
            "translation": {
                "language": "vi",
                "content": "",
            },
            "metadata": {},
        }

    elif raw_type == "image":
        attrs = chunk.get("attributes", {})
        src = attrs.get("src", "")
        alt = attrs.get("alt", "")
        img_hash = compute_sha256(f"{src}:{alt}")
        block = {
            "id": block_id,
            "type": "image",
            "order": order,
            "source_hash": img_hash,
            "translation_status": "pending" if alt else "not_applicable",
            "original": {
                "language": "en",
                "content": alt,
            },
            "translation": {
                "language": "vi",
                "content": alt,
            },
            "metadata": {
                "src": src,
                "alt": alt,
                "attributes": attrs,
            },
        }

    elif raw_type == "custom_container":
        comp_name = chunk.get("component_name", "")
        attrs = chunk.get("attributes", {})
        inner = chunk.get("inner_content", "")
        c_hash = compute_sha256(inner)

        if comp_name in ["programming-exercise", "in-browser-programming-exercise"]:
            name = attrs.get("name", "Exercise")
            tmc_name = attrs.get("tmcname", "")
            height = attrs.get("height", None)

            # Look for starter code inside exercise
            starter_code = None
            code_m = re.search(r"```python\s*\n(.*?)\n```", inner, re.DOTALL)
            if code_m:
                starter_code = code_m.group(1)

            ex_id = f"ex-{tmc_name}" if tmc_name else f"ex-{lesson_id}-{order}"
            extracted_exercise = {
                "id": ex_id,
                "lesson_id": lesson_id,
                "part": part_num,
                "tmc_name": tmc_name,
                "title_original": name,
                "title_vi": "",
                "exercise_type": comp_name,
                "height": height,
                "description_original": inner,
                "description_vi": "",
                "starter_code": starter_code,
                "grading_data_available": False,
                "source_hash": c_hash,
                "order": order,
            }

            block = {
                "id": block_id,
                "type": "exercise",
                "order": order,
                "source_hash": c_hash,
                "translation_status": "pending",
                "original": {
                    "language": "en",
                    "content": inner,
                },
                "translation": {
                    "language": "vi",
                    "content": "",
                },
                "metadata": {
                    "exercise_id": ex_id,
                    "exercise_type": comp_name,
                    "name": name,
                    "tmc_name": tmc_name,
                    "height": height,
                },
            }

        elif comp_name == "sample-output":
            block = {
                "id": block_id,
                "type": "sample_output",
                "order": order,
                "source_hash": c_hash,
                "translation_status": "not_applicable",
                "original": {
                    "language": "text",
                    "content": inner,
                },
                "translation": {
                    "language": "text",
                    "content": inner,
                },
                "metadata": {
                    "raw_source": chunk.get("raw_source"),
                },
            }

        elif comp_name == "sample-data":
            block = {
                "id": block_id,
                "type": "sample_data",
                "order": order,
                "source_hash": c_hash,
                "translation_status": "not_applicable",
                "original": {
                    "language": "text",
                    "content": inner,
                },
                "translation": {
                    "language": "text",
                    "content": inner,
                },
                "metadata": {
                    "raw_source": chunk.get("raw_source"),
                },
            }

        elif comp_name == "text-box":
            variant = attrs.get("variant", "note")
            name = attrs.get("name", variant.capitalize())
            block = {
                "id": block_id,
                "type": "text_box",
                "order": order,
                "source_hash": c_hash,
                "translation_status": "pending",
                "original": {
                    "language": "en",
                    "content": inner,
                },
                "translation": {
                    "language": "vi",
                    "content": "",
                },
                "metadata": {
                    "variant": variant,
                    "name_original": name,
                    "name_vi": "",
                    "attributes": attrs,
                },
            }

        elif comp_name == "quiz":
            quiz_id = attrs.get("id", "")
            block = {
                "id": block_id,
                "type": "quiz",
                "order": order,
                "source_hash": c_hash,
                "translation_status": "pending" if inner else "not_applicable",
                "original": {
                    "language": "en",
                    "content": inner,
                },
                "translation": {
                    "language": "vi",
                    "content": "",
                },
                "metadata": {
                    "quiz_id": quiz_id,
                    "attributes": attrs,
                },
            }

        else:
            # General custom component with inner content
            block = {
                "id": block_id,
                "type": "custom_component",
                "order": order,
                "source_hash": c_hash,
                "translation_status": "pending" if inner else "not_applicable",
                "original": {
                    "language": "en",
                    "content": inner,
                },
                "translation": {
                    "language": "vi",
                    "content": "",
                },
                "metadata": {
                    "component_name": comp_name,
                    "attributes": attrs,
                    "raw_source": chunk.get("raw_source"),
                    "parsed": True,
                },
            }

    elif raw_type == "custom_self_closing":
        comp_name = chunk.get("component_name", "")
        attrs = chunk.get("attributes", {})
        raw_src = chunk.get("raw_source", "")
        sc_hash = compute_sha256(raw_src)

        block = {
            "id": block_id,
            "type": "custom_component",
            "order": order,
            "source_hash": sc_hash,
            "translation_status": "not_applicable",
            "original": {
                "language": "component",
                "content": raw_src,
            },
            "translation": {
                "language": "component",
                "content": raw_src,
            },
            "metadata": {
                "component_name": comp_name,
                "attributes": attrs,
                "raw_source": raw_src,
                "parsed": True,
            },
        }

    else:
        # Fallback for unexpected format - preserve raw source
        raw_src = chunk.get("raw_source", str(chunk))
        fb_hash = compute_sha256(raw_src)
        block = {
            "id": block_id,
            "type": "custom_component",
            "order": order,
            "source_hash": fb_hash,
            "translation_status": "not_applicable",
            "original": {
                "language": "raw",
                "content": raw_src,
            },
            "translation": {
                "language": "raw",
                "content": raw_src,
            },
            "metadata": {
                "raw_source": raw_src,
                "parsed": False,
            },
        }

    return block, extracted_exercise


def run_normalization() -> Dict[str, Any]:
    print("Running normalization...")
    raw_lessons = sorted((RAW_DIR / "lessons").glob("*.json"))
    raw_pages = sorted((RAW_DIR / "pages").glob("*.json"))

    total_blocks = 0
    total_exercises = 0
    exercises_map = {}
    parts_map = {}

    # 1. Process Lessons
    for lesson_file in raw_lessons:
        raw_data = safe_read_json(str(lesson_file))
        lesson_id = raw_data["id"]
        part_num = raw_data.get("part")
        part_slug = raw_data.get("part_slug")
        chunks = raw_data.get("raw_chunks", [])

        normalized_blocks = []
        for idx, chunk in enumerate(chunks, start=1):
            block_id = f"blk-{lesson_id}-{idx:04d}"
            block, ex = normalize_chunk(chunk, block_id, idx, lesson_id, part_num)
            normalized_blocks.append(block)
            total_blocks += 1

            if ex:
                ex_id = ex["id"]
                exercises_map[ex_id] = ex
                total_exercises += 1
                safe_write_json(str(NORMALIZED_DIR / "exercises" / f"{ex_id}.json"), ex)

        lesson_doc = {
            "id": lesson_id,
            "part": part_num,
            "part_slug": part_slug,
            "slug": raw_data["slug"],
            "is_part_index": raw_data.get("is_part_index", False),
            "title_original": raw_data["title_original"],
            "title_vi": "",
            "path": raw_data["path"],
            "source_path": raw_data["source_path"],
            "source_hash": raw_data["source_hash"],
            "order": raw_data.get("frontmatter", {}).get("sidebar_priority", 1),
            "blocks_count": len(normalized_blocks),
            "blocks": normalized_blocks,
        }
        safe_write_json(str(NORMALIZED_DIR / "lessons" / f"{lesson_id}.json"), lesson_doc)

        # Track parts
        if part_num:
            if part_slug not in parts_map:
                parts_map[part_slug] = {
                    "part": part_num,
                    "slug": part_slug,
                    "title_original": f"Part {part_num}",
                    "title_vi": f"Phần {part_num}",
                    "lessons": [],
                }
            parts_map[part_slug]["lessons"].append({
                "id": lesson_id,
                "slug": raw_data["slug"],
                "is_index": raw_data.get("is_part_index", False),
                "title_original": raw_data["title_original"],
                "path": raw_data["path"],
                "blocks_count": len(normalized_blocks),
            })

    # Save Part documents
    for p_slug, p_data in parts_map.items():
        safe_write_json(str(NORMALIZED_DIR / "parts" / f"{p_slug}.json"), p_data)

    # 2. Process General Pages
    for page_file in raw_pages:
        raw_data = safe_read_json(str(page_file))
        page_id = raw_data["id"]
        chunks = raw_data.get("raw_chunks", [])

        normalized_blocks = []
        for idx, chunk in enumerate(chunks, start=1):
            block_id = f"blk-{page_id}-{idx:04d}"
            block, ex = normalize_chunk(chunk, block_id, idx, page_id, None)
            normalized_blocks.append(block)
            total_blocks += 1
            if ex:
                ex_id = ex["id"]
                exercises_map[ex_id] = ex
                total_exercises += 1
                safe_write_json(str(NORMALIZED_DIR / "exercises" / f"{ex_id}.json"), ex)

        page_doc = {
            "id": page_id,
            "slug": raw_data["slug"],
            "title_original": raw_data["title_original"],
            "title_vi": "",
            "path": raw_data["path"],
            "source_path": raw_data["source_path"],
            "source_hash": raw_data["source_hash"],
            "blocks_count": len(normalized_blocks),
            "blocks": normalized_blocks,
        }
        safe_write_json(str(NORMALIZED_DIR / "pages" / f"{page_id}.json"), page_doc)

    manifest = {
        "total_lessons_files": len(raw_lessons),
        "total_pages_files": len(raw_pages),
        "total_parts": len(parts_map),
        "total_blocks": total_blocks,
        "total_exercises": total_exercises,
    }
    safe_write_json(str(MANIFESTS_DIR / "normalization_manifest.json"), manifest)

    print(f"Normalization complete!")
    print(f"Total Blocks: {total_blocks}")
    print(f"Total Exercises: {total_exercises}")
    print(f"Total Parts: {len(parts_map)}")
    return manifest


if __name__ == "__main__":
    run_normalization()
