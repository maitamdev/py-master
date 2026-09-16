"""
PYTHON-MASTER Dataset Freeze Script
=====================================
Creates an immutable release snapshot of the dataset.

Usage:
    python scripts/freeze.py
    python scripts/freeze.py --version 1.0.0
    python scripts/freeze.py --verify
"""
import argparse
import glob
import hashlib
import json
import os
import shutil
import sys
from datetime import datetime, timezone


def sha256_file(filepath):
    """Compute SHA-256 hash of a file."""
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while True:
            chunk = f.read(8192)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def freeze_dataset(version="1.0.0", export_dir="data/export", asset_dir="assets",
                   audit_report="reports/audit_report.json", output_dir=None):
    """Create a frozen release of the dataset."""

    if output_dir is None:
        output_dir = os.path.join("releases", f"v{version}")

    if os.path.exists(output_dir):
        print(f"WARNING: {output_dir} already exists. Removing...")
        shutil.rmtree(output_dir)

    os.makedirs(output_dir, exist_ok=True)

    checksums = {}
    file_count = 0

    # ================================================================
    # 1. Copy course.json
    # ================================================================
    src = os.path.join(export_dir, "course.json")
    if os.path.exists(src):
        dst = os.path.join(output_dir, "course.json")
        shutil.copy2(src, dst)
        checksums["course.json"] = f"sha256:{sha256_file(dst)}"
        file_count += 1
        print(f"  [COPY] course.json")
    else:
        # Fallback to root course.json
        src = "course.json"
        if os.path.exists(src):
            dst = os.path.join(output_dir, "course.json")
            shutil.copy2(src, dst)
            checksums["course.json"] = f"sha256:{sha256_file(dst)}"
            file_count += 1
            print(f"  [COPY] course.json (from root)")

    # ================================================================
    # 2. Copy manifest.json
    # ================================================================
    src = os.path.join(export_dir, "manifest.json")
    if os.path.exists(src):
        dst = os.path.join(output_dir, "manifest.json")
        shutil.copy2(src, dst)
        checksums["manifest.json"] = f"sha256:{sha256_file(dst)}"
        file_count += 1
        print(f"  [COPY] manifest.json")

    # ================================================================
    # 3. Copy parts/
    # ================================================================
    parts_src = os.path.join(export_dir, "parts")
    parts_dst = os.path.join(output_dir, "parts")
    if os.path.exists(parts_src):
        os.makedirs(parts_dst, exist_ok=True)
        for f in sorted(glob.glob(os.path.join(parts_src, "*.json"))):
            fname = os.path.basename(f)
            dst = os.path.join(parts_dst, fname)
            shutil.copy2(f, dst)
            checksums[f"parts/{fname}"] = f"sha256:{sha256_file(dst)}"
            file_count += 1
        print(f"  [COPY] parts/ ({len(os.listdir(parts_dst))} files)")

    # ================================================================
    # 4. Copy lessons/
    # ================================================================
    lessons_src = os.path.join(export_dir, "lessons")
    lessons_dst = os.path.join(output_dir, "lessons")
    if os.path.exists(lessons_src):
        os.makedirs(lessons_dst, exist_ok=True)
        for f in sorted(glob.glob(os.path.join(lessons_src, "*.json"))):
            fname = os.path.basename(f)
            dst = os.path.join(lessons_dst, fname)
            shutil.copy2(f, dst)
            checksums[f"lessons/{fname}"] = f"sha256:{sha256_file(dst)}"
            file_count += 1
        print(f"  [COPY] lessons/ ({len(os.listdir(lessons_dst))} files)")

    # ================================================================
    # 5. Copy exercises/
    # ================================================================
    exercises_src = os.path.join(export_dir, "exercises")
    exercises_dst = os.path.join(output_dir, "exercises")
    if os.path.exists(exercises_src):
        os.makedirs(exercises_dst, exist_ok=True)
        for f in sorted(glob.glob(os.path.join(exercises_src, "*.json"))):
            fname = os.path.basename(f)
            dst = os.path.join(exercises_dst, fname)
            shutil.copy2(f, dst)
            checksums[f"exercises/{fname}"] = f"sha256:{sha256_file(dst)}"
            file_count += 1
        print(f"  [COPY] exercises/ ({len(os.listdir(exercises_dst))} files)")

    # ================================================================
    # 6. Copy audit report
    # ================================================================
    if os.path.exists(audit_report):
        dst = os.path.join(output_dir, "audit_report.json")
        shutil.copy2(audit_report, dst)
        checksums["audit_report.json"] = f"sha256:{sha256_file(dst)}"
        file_count += 1
        print(f"  [COPY] audit_report.json")

    # ================================================================
    # 7. Copy glossary
    # ================================================================
    glossary_src = "glossary/python_vi.json"
    if os.path.exists(glossary_src):
        dst = os.path.join(output_dir, "glossary.json")
        shutil.copy2(glossary_src, dst)
        checksums["glossary.json"] = f"sha256:{sha256_file(dst)}"
        file_count += 1
        print(f"  [COPY] glossary.json")

    # ================================================================
    # 8. Load source info
    # ================================================================
    source_info = {}
    if os.path.exists("source_snapshot.json"):
        with open("source_snapshot.json", "r", encoding="utf-8") as f:
            source_info = json.load(f)

    course_info = {}
    course_path = os.path.join(output_dir, "course.json")
    if os.path.exists(course_path):
        with open(course_path, "r", encoding="utf-8") as f:
            course_info = json.load(f)

    # ================================================================
    # 9. Create dataset_info.json
    # ================================================================
    dataset_info = {
        "dataset_version": version,
        "schema_version": "1.0",
        "source": {
            "name": "University of Helsinki",
            "repository": course_info.get("source_repository",
                          "https://github.com/rage/programming-26"),
            "commit": course_info.get("source_commit",
                      source_info.get("commit_sha", "")),
            "license": "CC BY-NC-SA 4.0",
            "imported_at": course_info.get("imported_at", ""),
        },
        "language": {
            "original": "en",
            "translation": "vi",
        },
        "stats": {
            "parts": course_info.get("total_parts", 14),
            "lessons": course_info.get("total_lessons", 78),
            "exercises": course_info.get("total_exercises", 283),
            "blocks": 3711,  # From audit
            "images": 338,
        },
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_files": file_count,
        "checksums": checksums,
    }

    # Update block count from audit if available
    if os.path.exists(audit_report):
        with open(audit_report, "r", encoding="utf-8") as f:
            audit = json.load(f)
        dataset_info["stats"]["blocks"] = audit.get("summary", {}).get("total_blocks", 3711)
        dataset_info["audit_passed"] = audit.get("pass", False)

    info_path = os.path.join(output_dir, "dataset_info.json")
    with open(info_path, "w", encoding="utf-8") as f:
        json.dump(dataset_info, f, ensure_ascii=False, indent=2)
    print(f"  [CREATE] dataset_info.json")

    return dataset_info


def verify_release(version="1.0.0", release_dir=None):
    """Verify checksums of a frozen release."""
    if release_dir is None:
        release_dir = os.path.join("releases", f"v{version}")

    info_path = os.path.join(release_dir, "dataset_info.json")
    if not os.path.exists(info_path):
        print(f"ERROR: {info_path} not found")
        return False

    with open(info_path, "r", encoding="utf-8") as f:
        info = json.load(f)

    checksums = info.get("checksums", {})
    total = len(checksums)
    passed = 0
    failed = 0

    print(f"Verifying {total} files in {release_dir}...")

    for rel_path, expected in sorted(checksums.items()):
        filepath = os.path.join(release_dir, rel_path)
        if not os.path.exists(filepath):
            print(f"  [MISSING] {rel_path}")
            failed += 1
            continue

        actual = f"sha256:{sha256_file(filepath)}"
        if actual == expected:
            passed += 1
        else:
            print(f"  [MISMATCH] {rel_path}")
            print(f"    Expected: {expected}")
            print(f"    Actual:   {actual}")
            failed += 1

    print(f"\nVerification: {passed}/{total} passed, {failed} failed")
    return failed == 0


def main():
    parser = argparse.ArgumentParser(description="Freeze PYTHON-MASTER dataset")
    parser.add_argument("--version", default="1.0.0", help="Dataset version")
    parser.add_argument("--verify", action="store_true", help="Verify existing release")
    parser.add_argument("--export-dir", default="data/export")
    parser.add_argument("--audit-report", default="reports/audit_report.json")
    args = parser.parse_args()

    if args.verify:
        print("=" * 60)
        print(f"Verifying release v{args.version}")
        print("=" * 60)
        ok = verify_release(args.version)
        return 0 if ok else 1

    print("=" * 60)
    print(f"Freezing dataset v{args.version}")
    print("=" * 60)

    info = freeze_dataset(
        version=args.version,
        export_dir=args.export_dir,
        audit_report=args.audit_report,
    )

    print(f"\n{'=' * 60}")
    print(f"Dataset v{args.version} frozen successfully!")
    print(f"  Location: releases/v{args.version}/")
    print(f"  Files:    {info['total_files']}")
    print(f"  Checksum entries: {len(info['checksums'])}")
    print(f"{'=' * 60}")

    # Auto-verify
    print(f"\nAuto-verifying...")
    ok = verify_release(args.version)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
