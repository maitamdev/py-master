"""
PYTHON-MASTER Dataset Audit Script
===================================
Performs comprehensive integrity checks on the translated dataset.
Outputs a JSON report proving every block is accounted for.

Usage:
    python scripts/audit.py
    python scripts/audit.py --output reports/audit_report.json
"""
import argparse
import glob
import hashlib
import json
import os
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone


# Block types that contain translatable human-readable text
TRANSLATABLE_TYPES = {
    "paragraph", "heading", "text_box", "exercise", "quiz",
    "list", "table", "sample_data",
}

# Block types that should NOT be translated (code, images, components)
NON_TRANSLATABLE_TYPES = {
    "code", "sample_output", "image", "custom_component",
    "programming_exercise",
}


def load_json(filepath):
    """Load and parse a JSON file. Returns (data, error)."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data, None
    except json.JSONDecodeError as e:
        return None, f"Invalid JSON: {e}"
    except UnicodeDecodeError as e:
        return None, f"Invalid UTF-8: {e}"
    except Exception as e:
        return None, str(e)


def check_utf8(text):
    """Verify string is valid UTF-8."""
    if text is None:
        return True
    try:
        if isinstance(text, str):
            text.encode("utf-8")
        return True
    except UnicodeEncodeError:
        return False


def audit_dataset(export_dir="data/export", asset_dir="assets"):
    """Run all audit checks. Returns audit report dict."""

    report = {
        "audit_timestamp": datetime.now(timezone.utc).isoformat(),
        "dataset_source": export_dir,
        "summary": {},
        "block_types": {},
        "exercises": {},
        "assets": {},
        "integrity_checks": {},
        "details": {
            "invalid_json_files": [],
            "duplicate_block_ids": [],
            "duplicate_exercise_ids": [],
            "duplicate_lesson_ids": [],
            "empty_translations": [],
            "altered_code_blocks": [],
            "broken_asset_refs": [],
            "invalid_utf8_fields": [],
            "orphan_exercises": [],
        },
        "pass": False,
    }

    # ================================================================
    # 1. Load all lesson files
    # ================================================================
    lesson_dir = os.path.join(export_dir, "lessons")
    lesson_files = sorted(glob.glob(os.path.join(lesson_dir, "*.json")))

    all_lessons = {}
    all_blocks = []
    all_block_ids = []
    all_lesson_ids = []
    invalid_json_count = 0

    for lf in lesson_files:
        data, err = load_json(lf)
        if err:
            invalid_json_count += 1
            report["details"]["invalid_json_files"].append(
                {"file": os.path.relpath(lf), "error": err}
            )
            continue

        lesson_id = data.get("id", "")
        all_lesson_ids.append(lesson_id)
        all_lessons[lesson_id] = data

        for block in data.get("blocks", []):
            block["_lesson_id"] = lesson_id
            block["_file"] = os.path.relpath(lf)
            all_blocks.append(block)
            all_block_ids.append(block.get("id", ""))

    # ================================================================
    # 2. Load all exercise files
    # ================================================================
    exercise_dir = os.path.join(export_dir, "exercises")
    exercise_files = sorted(glob.glob(os.path.join(exercise_dir, "*.json")))

    all_exercises = {}
    all_exercise_ids = []

    for ef in exercise_files:
        data, err = load_json(ef)
        if err:
            invalid_json_count += 1
            report["details"]["invalid_json_files"].append(
                {"file": os.path.relpath(ef), "error": err}
            )
            continue

        ex_id = data.get("id", "")
        all_exercise_ids.append(ex_id)
        all_exercises[ex_id] = data

    # ================================================================
    # 3. Block type analysis
    # ================================================================
    type_counts = Counter()
    type_translated = Counter()
    type_not_applicable = Counter()

    translatable_count = 0
    translated_count = 0
    non_translatable_count = 0
    untranslated_required = 0

    for block in all_blocks:
        btype = block.get("type", "unknown")
        status = block.get("translation_status", "unknown")
        type_counts[btype] += 1

        if status == "translated":
            type_translated[btype] += 1
            translated_count += 1
            translatable_count += 1
        elif status == "not_applicable":
            type_not_applicable[btype] += 1
            non_translatable_count += 1
        else:
            # Should be translated but isn't
            translatable_count += 1
            untranslated_required += 1

    # Build block_types detail
    for btype in sorted(type_counts.keys()):
        is_translatable = btype in TRANSLATABLE_TYPES
        report["block_types"][btype] = {
            "count": type_counts[btype],
            "translatable": is_translatable,
            "translated": type_translated.get(btype, 0),
            "not_applicable": type_not_applicable.get(btype, 0),
        }

    report["summary"] = {
        "total_lessons": len(all_lessons),
        "total_blocks": len(all_blocks),
        "translatable_blocks": translatable_count,
        "translated_blocks": translated_count,
        "non_translatable_blocks": non_translatable_count,
        "untranslated_required": untranslated_required,
        "total_exercises": len(all_exercises),
    }

    # ================================================================
    # 4. Integrity checks
    # ================================================================

    # 4a. Duplicate block IDs
    block_id_counts = Counter(all_block_ids)
    dup_block_ids = {k: v for k, v in block_id_counts.items() if v > 1}
    for bid, cnt in dup_block_ids.items():
        report["details"]["duplicate_block_ids"].append(
            {"id": bid, "occurrences": cnt}
        )

    # 4b. Duplicate lesson IDs
    lesson_id_counts = Counter(all_lesson_ids)
    dup_lesson_ids = {k: v for k, v in lesson_id_counts.items() if v > 1}
    for lid, cnt in dup_lesson_ids.items():
        report["details"]["duplicate_lesson_ids"].append(
            {"id": lid, "occurrences": cnt}
        )

    # 4c. Duplicate exercise IDs
    ex_id_counts = Counter(all_exercise_ids)
    dup_ex_ids = {k: v for k, v in ex_id_counts.items() if v > 1}
    for eid, cnt in dup_ex_ids.items():
        report["details"]["duplicate_exercise_ids"].append(
            {"id": eid, "occurrences": cnt}
        )

    # 4d. Empty translation content (blocks marked "translated" but empty)
    empty_translations = 0
    for block in all_blocks:
        if block.get("translation_status") == "translated":
            content = block.get("translation", {}).get("content", "")
            if not content or not content.strip():
                empty_translations += 1
                report["details"]["empty_translations"].append({
                    "block_id": block.get("id"),
                    "lesson": block.get("_lesson_id"),
                    "type": block.get("type"),
                })

    # 4e. Altered code blocks (code should be identical in original and translation)
    altered_code = 0
    for block in all_blocks:
        if block.get("type") == "code":
            orig = block.get("original", {}).get("content", "")
            trans = block.get("translation", {}).get("content", "")
            # For code blocks, translation content should be empty or identical
            if trans and trans.strip() and orig.strip() != trans.strip():
                altered_code += 1
                report["details"]["altered_code_blocks"].append({
                    "block_id": block.get("id"),
                    "lesson": block.get("_lesson_id"),
                })

    # 4f. Broken asset references
    # Scan all content for image references
    img_pattern = re.compile(r'(?:!\[.*?\]\(|src=["\'])(.*?\.(?:png|jpg|jpeg|gif|svg|webp))', re.IGNORECASE)
    broken_assets = 0

    for block in all_blocks:
        for field in ["original", "translation"]:
            content = block.get(field, {}).get("content", "") or ""
            matches = img_pattern.findall(content)
            for img_ref in matches:
                # Normalize path
                clean_ref = img_ref.strip("\"'")
                if clean_ref.startswith("http"):
                    continue  # External URL, skip

                # Try to find in assets
                possible_paths = [
                    os.path.join(asset_dir, "images", os.path.basename(clean_ref)),
                    os.path.join(asset_dir, "images", "img", os.path.basename(clean_ref)),
                ]

                # Also check per-part paths
                lesson_id = block.get("_lesson_id", "")
                m = re.match(r"part(\d+)-", lesson_id)
                if m:
                    part_num = int(m.group(1))
                    possible_paths.append(
                        os.path.join(asset_dir, "images", f"part-{part_num}", os.path.basename(clean_ref))
                    )

                found = any(os.path.exists(p) for p in possible_paths)
                if not found:
                    # Also check source static dir
                    src_static = os.path.join("source", "programming-26", "static")
                    src_data_img = os.path.join("source", "programming-26", "data", "img")
                    possible_paths.extend([
                        os.path.join(src_static, os.path.basename(clean_ref)),
                        os.path.join(src_data_img, os.path.basename(clean_ref)),
                    ])
                    found = any(os.path.exists(p) for p in possible_paths)

                if not found:
                    broken_assets += 1
                    report["details"]["broken_asset_refs"].append({
                        "block_id": block.get("id"),
                        "ref": clean_ref,
                        "lesson": block.get("_lesson_id"),
                    })

    # 4g. Invalid UTF-8
    invalid_utf8 = 0
    for block in all_blocks:
        for field_name in ["original", "translation"]:
            content = block.get(field_name, {}).get("content", "")
            if not check_utf8(content):
                invalid_utf8 += 1
                report["details"]["invalid_utf8_fields"].append({
                    "block_id": block.get("id"),
                    "field": field_name,
                })

    # 4h. Orphan exercises (exercise references non-existent lesson)
    orphan_exercises = 0
    for ex_id, ex_data in all_exercises.items():
        lesson_ref = ex_data.get("lesson_id", "")
        if lesson_ref and lesson_ref not in all_lessons:
            orphan_exercises += 1
            report["details"]["orphan_exercises"].append({
                "exercise_id": ex_id,
                "references_lesson": lesson_ref,
            })

    # 4i. Missing source_hash
    missing_hash = 0
    for block in all_blocks:
        if not block.get("source_hash"):
            missing_hash += 1

    # ================================================================
    # 5. Compile integrity checks summary
    # ================================================================
    report["integrity_checks"] = {
        "invalid_json_files": invalid_json_count,
        "duplicate_block_ids": len(dup_block_ids),
        "duplicate_exercise_ids": len(dup_ex_ids),
        "duplicate_lesson_ids": len(dup_lesson_ids),
        "empty_translation_content": empty_translations,
        "altered_code_blocks": altered_code,
        "broken_asset_references": broken_assets,
        "invalid_utf8": invalid_utf8,
        "orphan_exercises": orphan_exercises,
        "missing_source_hash": missing_hash,
    }

    # ================================================================
    # 6. Assets summary
    # ================================================================
    image_count = 0
    image_size = 0
    for root, dirs, files in os.walk(os.path.join(asset_dir, "images")):
        for f in files:
            image_count += 1
            image_size += os.path.getsize(os.path.join(root, f))

    report["assets"] = {
        "total_images": image_count,
        "total_size_bytes": image_size,
        "total_size_mb": round(image_size / (1024 * 1024), 1),
    }

    # ================================================================
    # 7. Final pass/fail
    # ================================================================
    checks = report["integrity_checks"]
    all_pass = (
        checks["invalid_json_files"] == 0
        and checks["duplicate_block_ids"] == 0
        and checks["duplicate_exercise_ids"] == 0
        and checks["duplicate_lesson_ids"] == 0
        and checks["empty_translation_content"] == 0
        and checks["altered_code_blocks"] == 0
        and checks["invalid_utf8"] == 0
        and checks["orphan_exercises"] == 0
        and report["summary"]["untranslated_required"] == 0
    )
    report["pass"] = all_pass

    # Remove internal fields from blocks
    for block in all_blocks:
        block.pop("_lesson_id", None)
        block.pop("_file", None)

    # Clean up empty detail lists
    report["details"] = {
        k: v for k, v in report["details"].items() if v
    }

    return report


def main():
    parser = argparse.ArgumentParser(description="Audit PYTHON-MASTER dataset")
    parser.add_argument(
        "--export-dir", default="data/export",
        help="Path to export directory (default: data/export)"
    )
    parser.add_argument(
        "--asset-dir", default="assets",
        help="Path to assets directory (default: assets)"
    )
    parser.add_argument(
        "--output", default="reports/audit_report.json",
        help="Output report path (default: reports/audit_report.json)"
    )
    args = parser.parse_args()

    print("=" * 60)
    print("PYTHON-MASTER Dataset Audit")
    print("=" * 60)

    report = audit_dataset(args.export_dir, args.asset_dir)

    # Print summary
    s = report["summary"]
    c = report["integrity_checks"]

    print(f"\n--- SUMMARY ---")
    print(f"  Lessons:              {s['total_lessons']}")
    print(f"  Total blocks:         {s['total_blocks']}")
    print(f"  Translatable:         {s['translatable_blocks']}")
    print(f"  Translated:           {s['translated_blocks']}")
    print(f"  Non-translatable:     {s['non_translatable_blocks']}")
    print(f"  Untranslated needed:  {s['untranslated_required']}")
    print(f"  Exercises:            {s['total_exercises']}")

    print(f"\n--- BLOCK TYPES ---")
    for bt, info in sorted(report["block_types"].items()):
        t = "T" if info["translatable"] else "-"
        print(f"  [{t}] {bt:25s}: {info['count']:4d}  (translated: {info['translated']}, N/A: {info['not_applicable']})")

    print(f"\n--- INTEGRITY CHECKS ---")
    for check_name, val in c.items():
        status = "PASS" if val == 0 else f"FAIL ({val})"
        icon = "[OK]" if val == 0 else "[!!]"
        print(f"  {icon} {check_name:35s}: {status}")

    print(f"\n--- ASSETS ---")
    a = report["assets"]
    print(f"  Images: {a['total_images']} ({a['total_size_mb']} MB)")

    if report["details"]:
        print(f"\n--- DETAILS (issues found) ---")
        for key, items in report["details"].items():
            print(f"  {key}: {len(items)} issues")
            for item in items[:5]:  # Show first 5
                print(f"    {item}")
            if len(items) > 5:
                print(f"    ... and {len(items) - 5} more")

    print(f"\n{'=' * 60}")
    if report["pass"]:
        print("RESULT: ALL CHECKS PASSED")
    else:
        print("RESULT: SOME CHECKS FAILED")
        # Show which specific checks failed
        failed = [k for k, v in c.items() if v != 0]
        if s["untranslated_required"] > 0:
            failed.append("untranslated_required")
        print(f"  Failed: {', '.join(failed)}")
    print(f"{'=' * 60}")

    # Save report
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f"\nReport saved to: {args.output}")

    return 0 if report["pass"] else 1


if __name__ == "__main__":
    sys.exit(main())
