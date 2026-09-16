"""Export script for Helsinki Python MOOC 2026.
Bundles and packages the validated bilingual dataset into a canonical production-grade export
structure ready for direct ingestion into Supabase.
"""

import json
import os
import shutil
import sys
from pathlib import Path
from typing import Any, Dict, List

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from scripts.utils import (
    compute_file_sha256,
    compute_sha256,
    ensure_dirs,
    safe_read_json,
    safe_write_json,
)

BASE_DIR = Path(__file__).resolve().parent.parent
TRANSLATED_DIR = BASE_DIR / "data" / "translated"
EXPORT_DIR = BASE_DIR / "data" / "export"
SNAPSHOT_PATH = BASE_DIR / "source_snapshot.json"
REPORTS_DIR = BASE_DIR / "reports"

ensure_dirs(
    str(EXPORT_DIR / "parts"),
    str(EXPORT_DIR / "lessons"),
    str(EXPORT_DIR / "exercises"),
)


def run_export() -> Dict[str, Any]:
    print("Exporting canonical dataset for Supabase...")

    snapshot = safe_read_json(str(SNAPSHOT_PATH)) if SNAPSHOT_PATH.exists() else {}

    # 1. Export Parts
    part_files = sorted((TRANSLATED_DIR / "parts").glob("*.json"))
    parts_manifest = []
    for pf in part_files:
        p_doc = safe_read_json(str(pf))
        dest = EXPORT_DIR / "parts" / pf.name
        safe_write_json(str(dest), p_doc)
        parts_manifest.append({
            "part": p_doc.get("part"),
            "slug": p_doc.get("slug"),
            "title_original": p_doc.get("title_original"),
            "title_vi": p_doc.get("title_vi"),
            "lessons_count": len(p_doc.get("lessons", [])),
        })

    # 2. Export Lessons
    lesson_files = sorted((TRANSLATED_DIR / "lessons").glob("*.json"))
    for lf in lesson_files:
        l_doc = safe_read_json(str(lf))
        dest = EXPORT_DIR / "lessons" / lf.name
        safe_write_json(str(dest), l_doc)

    # 3. Export Exercises
    exercise_files = sorted((TRANSLATED_DIR / "exercises").glob("*.json"))
    for ef in exercise_files:
        ex_doc = safe_read_json(str(ef))
        dest = EXPORT_DIR / "exercises" / ef.name
        safe_write_json(str(dest), ex_doc)

    # 4. Generate Master course.json
    course_metadata = {
        "id": "helsinki-python-mooc-2026",
        "slug": "programming-26",
        "name_en": "Python Programming MOOC 2026",
        "name_vi": "Khóa học Lập trình Python MOOC 2026",
        "organization": "University of Helsinki",
        "department": "Department of Computer Science",
        "platform": "MOOC.fi",
        "source_repository": snapshot.get("source_repository", "https://github.com/rage/programming-26"),
        "source_commit": snapshot.get("commit_sha", "880031470e606619945c9bb896999f26c332c2ca"),
        "source_license": snapshot.get("source_license", "Creative Commons BY-NC-SA 4.0 / Apache 2.0"),
        "imported_at": snapshot.get("imported_at", "2026-09-16T15:46:00+07:00"),
        "total_parts": len(part_files),
        "total_lessons": len(lesson_files),
        "total_exercises": len(exercise_files),
        "parts": parts_manifest,
        "supabase_target_tables": [
            "courses",
            "modules",
            "lessons",
            "lesson_blocks",
            "exercises",
            "exercise_hints",
            "assets",
            "glossary",
        ],
    }

    # Save to export and root
    safe_write_json(str(EXPORT_DIR / "course.json"), course_metadata)
    safe_write_json(str(BASE_DIR / "course.json"), course_metadata)

    # 5. Export Manifest
    manifest = {
        "export_timestamp": "2026-09-16T16:00:00+07:00",
        "course": course_metadata,
        "exported_parts_count": len(part_files),
        "exported_lessons_count": len(lesson_files),
        "exported_exercises_count": len(exercise_files),
        "export_directories": {
            "course": "data/export/course.json",
            "parts": "data/export/parts/",
            "lessons": "data/export/lessons/",
            "exercises": "data/export/exercises/",
            "assets": "assets/",
            "glossary": "glossary/python_vi.json",
        },
    }
    safe_write_json(str(EXPORT_DIR / "manifest.json"), manifest)

    print("\n--- CANONICAL DATASET EXPORT COMPLETE ---")
    print(f"Course file: {EXPORT_DIR / 'course.json'}")
    print(f"Parts exported: {len(part_files)}")
    print(f"Lessons exported: {len(lesson_files)}")
    print(f"Exercises exported: {len(exercise_files)}")

    return manifest


if __name__ == "__main__":
    run_export()
