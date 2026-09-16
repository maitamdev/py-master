"""Master Pipeline CLI for Helsinki Python MOOC 2026 Localization.
Allows running individual phases or the full end-to-end pipeline:
    python pipeline.py inventory
    python pipeline.py extract
    python pipeline.py normalize
    python pipeline.py translate
    python pipeline.py validate
    python pipeline.py export
    python pipeline.py all
"""

import argparse
import sys
import time


def main():
    parser = argparse.ArgumentParser(
        description="Helsinki Python MOOC 2026 Localization & Dataset Pipeline"
    )
    parser.add_argument(
        "stage",
        choices=["inventory", "extract", "normalize", "translate", "validate", "export", "all"],
        help="Pipeline stage to execute",
    )
    args = parser.parse_args()

    start_time = time.time()
    print("=" * 60)
    print(f"HELSINKI PYTHON MOOC 2026 PIPELINE - STAGE: {args.stage.upper()}")
    print("=" * 60)

    if args.stage in ["inventory", "all"]:
        from scripts.inventory import run_inventory
        print("\n>>> PHASE 1 & 2: REPOSITORY INVENTORY")
        run_inventory()

    if args.stage in ["extract", "all"]:
        from scripts.extract import extract_all
        print("\n>>> PHASE 3A: EXTRACTION & ASSETS")
        extract_all()

    if args.stage in ["normalize", "all"]:
        from scripts.normalize import run_normalization
        print("\n>>> PHASE 3B: DATA NORMALIZATION")
        run_normalization()

    if args.stage in ["translate", "all"]:
        from scripts.translate import run_translation
        print("\n>>> PHASE 4: VIETNAMESE TRANSLATION")
        run_translation()

    if args.stage in ["validate", "all"]:
        from scripts.validate import run_validation
        print("\n>>> PHASE 5: AUTOMATED VALIDATION")
        run_validation()

    if args.stage in ["export", "all"]:
        from scripts.export import run_export
        print("\n>>> PHASE 6: CANONICAL EXPORT")
        run_export()

    total_time = time.time() - start_time
    print("\n" + "=" * 60)
    print(f"PIPELINE COMPLETED SUCCESSFULLY IN {total_time:.1f}s")
    print("=" * 60)


if __name__ == "__main__":
    main()
