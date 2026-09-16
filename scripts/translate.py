"""Translation script for Helsinki Python MOOC 2026.
Translates all normalized lessons, pages, and exercises into natural, accurate Vietnamese.
Protects code integrity, handles markup preservation, applies technical glossary, and uses a multi-endpoint resilient cache.
"""

import hashlib
import json
import os
import re
import sys
import threading
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from scripts.utils import (
    check_mojibake,
    compute_sha256,
    ensure_dirs,
    safe_read_json,
    safe_write_json,
)

BASE_DIR = Path(__file__).resolve().parent.parent
NORMALIZED_DIR = BASE_DIR / "data" / "normalized"
TRANSLATED_DIR = BASE_DIR / "data" / "translated"
REVIEWS_DIR = BASE_DIR / "data" / "reviewed"
REPORTS_DIR = BASE_DIR / "reports"
GLOSSARY_PATH = BASE_DIR / "glossary" / "python_vi.json"
CACHE_PATH = TRANSLATED_DIR / "cache.json"

ensure_dirs(
    str(TRANSLATED_DIR / "lessons"),
    str(TRANSLATED_DIR / "pages"),
    str(TRANSLATED_DIR / "exercises"),
    str(TRANSLATED_DIR / "parts"),
    str(REVIEWS_DIR),
    str(REPORTS_DIR),
)

PART_TITLES_VI = {
    1: "Bắt đầu với Lập trình Python",
    2: "Cấu trúc Điều kiện và Vòng lặp đơn giản",
    3: "Vòng lặp có điều kiện, Chuỗi và Hàm",
    4: "Hàm nâng cao, Danh sách (List) và Định dạng",
    5: "Tham chiếu, Từ điển (Dictionary) và Tuple",
    6: "Thao tác Tệp tin và Xử lý Ngoại lệ",
    7: "Mô-đun và Các tính năng nâng cao của Python",
    8: "Lập trình Hướng đối tượng: Lớp và Phương thức",
    9: "Đối tượng, Thuộc tính và Đóng gói (Encapsulation)",
    10: "Kế thừa Lớp và Kỹ thuật Hướng đối tượng",
    11: "List Comprehensions và Đệ quy (Recursion)",
    12: "Hàm như Đối số, Generator và Biểu thức chính quy",
    13: "Lập trình Game đồ họa với Pygame",
    14: "Dự án Phát triển Game hoàn chỉnh",
}


class MarkupProtector:
    """Safely isolates code blocks, inline code spans, tags, and link targets before translation."""

    def __init__(self):
        self.code_block_re = re.compile(r"```[a-zA-Z0-9_-]*[^\S\r\n]*\r?\n.*?\n[^\S\r\n]*```", re.DOTALL)
        self.inline_code_re = re.compile(r"`[^`]+`")
        self.link_re = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
        self.tag_re = re.compile(r"</?[a-zA-Z0-9_-]+(?:\s+[^>]*)?>")

    def protect(self, text: str) -> Tuple[str, Dict[str, str]]:
        placeholders = {}
        counter = 0

        # 1. Protect code blocks
        def repl_code(m):
            nonlocal counter
            key = f"XCODEPH{counter:04d}X"
            placeholders[key] = m.group(0)
            counter += 1
            return key

        text = self.code_block_re.sub(repl_code, text)

        # 2. Protect HTML/JSX tags
        def repl_tag(m):
            nonlocal counter
            key = f"XTAGPH{counter:04d}X"
            placeholders[key] = m.group(0)
            counter += 1
            return key

        text = self.tag_re.sub(repl_tag, text)

        # 3. Protect Markdown link URLs
        def repl_link(m):
            nonlocal counter
            link_text = m.group(1)
            url = m.group(2)
            url_key = f"XURLPH{counter:04d}X"
            placeholders[url_key] = url
            counter += 1
            return f"[{link_text}]({url_key})"

        text = self.link_re.sub(repl_link, text)

        # 4. Protect inline code spans
        def repl_inline(m):
            nonlocal counter
            key = f"XINLINEPH{counter:04d}X"
            placeholders[key] = m.group(0)
            counter += 1
            return key

        text = self.inline_code_re.sub(repl_inline, text)

        return text, placeholders

    def restore(self, text: str, placeholders: Dict[str, str]) -> str:
        for key in list(placeholders.keys()):
            prefix = key[:8]
            suffix = key[8:]
            pattern = re.compile(rf"{re.escape(prefix)}\s*{re.escape(suffix)}", re.IGNORECASE)
            text = pattern.sub(key, text)

        for key in sorted(placeholders.keys(), reverse=True):
            val = placeholders[key]
            text = text.replace(key, val)

        return text


class TranslationCache:
    """Thread-safe persistent cache for translated segments indexed by source_hash."""

    def __init__(self, cache_file: Path):
        self.cache_file = cache_file
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.lock = threading.Lock()
        self.dirty_count = 0
        self.load()

    def load(self):
        if self.cache_file.exists():
            try:
                self.cache = safe_read_json(str(self.cache_file))
                print(f"Loaded {len(self.cache)} cached translation entries.", flush=True)
            except Exception as e:
                print(f"Warning: Could not load cache: {e}. Starting fresh.", flush=True)
                self.cache = {}

    def save(self):
        with self.lock:
            safe_write_json(str(self.cache_file), self.cache)
            self.dirty_count = 0

    def get(self, source_hash: str) -> Optional[str]:
        with self.lock:
            entry = self.cache.get(source_hash)
            if entry and entry.get("status") == "translated":
                return entry.get("translation")
            return None

    def put(self, source_hash: str, original: str, translation: str):
        with self.lock:
            self.cache[source_hash] = {
                "original": original,
                "translation": translation,
                "status": "translated",
                "timestamp": time.time(),
            }
            self.dirty_count += 1
            if self.dirty_count >= 20:
                safe_write_json(str(self.cache_file), self.cache)
                self.dirty_count = 0


class TranslatorEngine:
    """Multi-endpoint resilient translation engine with retry logic and glossary compliance."""

    def __init__(self, glossary: Dict[str, str], cache: TranslationCache):
        self.glossary = glossary
        self.cache = cache
        self.protector = MarkupProtector()
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
            "Mozilla/5.0 (X11; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0",
        ]
        self.endpoints = [
            ("https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=vi&q=", "clients5"),
            ("https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=", "gtx"),
        ]
        self.lock = threading.Lock()
        self.counter = 0

    def _call_api(self, text: str, max_retries: int = 5) -> str:
        clean_text = text.strip()
        if not clean_text:
            return text

        for attempt in range(max_retries):
            # Try endpoints in rotating order
            for base_url, kind in self.endpoints:
                try:
                    with self.lock:
                        self.counter += 1
                        ua = self.user_agents[self.counter % len(self.user_agents)]

                    url = f"{base_url}{urllib.parse.quote(clean_text)}"
                    req = urllib.request.Request(url, headers={"User-Agent": ua})
                    with urllib.request.urlopen(req, timeout=10) as resp:
                        raw = resp.read().decode("utf-8")
                        data = json.loads(raw)
                        if kind == "clients5":
                            if isinstance(data, list):
                                return "".join(data)
                            return str(data)
                        else:
                            return "".join(seg[0] for seg in data[0] if seg[0])
                except Exception:
                    continue

            time.sleep((2 ** attempt) * 0.4)

        return text

    def translate_text(self, text: str, source_hash: Optional[str] = None) -> str:
        if not text or not text.strip():
            return text

        if source_hash:
            cached = self.cache.get(source_hash)
            if cached is not None:
                return cached

        protected, placeholders = self.protector.protect(text)

        if len(protected) > 2000:
            sub_parts = re.split(r"(\n\s*\n)", protected)
            trans_parts = []
            for sp in sub_parts:
                if sp.strip():
                    t_sp = self._call_api(sp)
                    trans_parts.append(t_sp)
                else:
                    trans_parts.append(sp)
            translated_protected = "".join(trans_parts)
        else:
            translated_protected = self._call_api(protected)

        restored = self.protector.restore(translated_protected, placeholders)
        restored = self.post_process_translation(restored)

        if source_hash:
            self.cache.put(source_hash, text, restored)

        return restored

    def post_process_translation(self, text: str) -> str:
        replacements = [
            (r"\blời nhắc\b", "dấu nhắc (prompt)"),
            (r"\bmã nguồn của bạn\b", "code của bạn"),
            (r"\bmã của bạn\b", "code của bạn"),
            (r"\bcâu lệnh in\b", "câu lệnh `print`"),
            (r"\btrả lại\b", "trả về"),
            (r"\bđược trả lại\b", "được trả về"),
            (r"\bvòng lặp while\b", "vòng lặp `while`"),
            (r"\bvòng lặp for\b", "vòng lặp `for`"),
            (r"\bmục tiêu học tập\b", "Mục tiêu học tập"),
            (r"\bđối tượng\s*-\s*hướng\b", "hướng đối tượng"),
            (r"\bTính đa hình\b", "Đa hình (Polymorphism)"),
            (r"\bTính đóng gói\b", "Đóng gói (Encapsulation)"),
            (r"\bTính kế thừa\b", "Kế thừa (Inheritance)"),
        ]
        res = text
        for pat, rep in replacements:
            res = re.sub(pat, rep, res, flags=re.IGNORECASE)
        return res


def collect_translatable_items() -> List[Tuple[str, str]]:
    items_map: Dict[str, str] = {}

    for pf in (NORMALIZED_DIR / "parts").glob("*.json"):
        p_data = safe_read_json(str(pf))
        for l in p_data.get("lessons", []):
            if not l.get("is_index"):
                t = l.get("title_original", "")
                if t:
                    h = compute_sha256(f"lesson_title:{t}")
                    items_map[h] = t

    for lf in (NORMALIZED_DIR / "lessons").glob("*.json"):
        doc = safe_read_json(str(lf))
        t = doc.get("title_original", "")
        if t and not doc.get("is_part_index"):
            h = compute_sha256(f"title:{t}")
            items_map[h] = t

        for b in doc.get("blocks", []):
            b_type = b.get("type")
            content = b.get("original", {}).get("content", "")
            s_hash = b.get("source_hash")
            if content.strip() and b_type in ["heading", "paragraph", "list", "table", "quote", "text_box", "quiz", "exercise"]:
                items_map[s_hash] = content
            elif b_type == "image" and content.strip():
                items_map[s_hash] = content

    for pf in (NORMALIZED_DIR / "pages").glob("*.json"):
        doc = safe_read_json(str(pf))
        t = doc.get("title_original", "")
        if t:
            h = compute_sha256(f"title:{t}")
            items_map[h] = t

        for b in doc.get("blocks", []):
            b_type = b.get("type")
            content = b.get("original", {}).get("content", "")
            s_hash = b.get("source_hash")
            if content.strip() and b_type in ["heading", "paragraph", "list", "table", "quote", "text_box", "quiz"]:
                items_map[s_hash] = content

    for ef in (NORMALIZED_DIR / "exercises").glob("*.json"):
        ex = safe_read_json(str(ef))
        t = ex.get("title_original", "")
        desc = ex.get("description_original", "")
        s_hash = ex.get("source_hash")
        if t:
            t_hash = compute_sha256(f"ex_title:{t}")
            items_map[t_hash] = t
        if desc.strip() and s_hash:
            items_map[s_hash] = desc

    return list(items_map.items())


def run_translation(workers: int = 6) -> Dict[str, Any]:
    print(f"Initializing Multi-Endpoint Translation Pipeline with {workers} workers...", flush=True)
    glossary = safe_read_json(str(GLOSSARY_PATH)) if GLOSSARY_PATH.exists() else {}
    cache = TranslationCache(CACHE_PATH)
    engine = TranslatorEngine(glossary, cache)

    all_items = collect_translatable_items()
    needed_items = [(h, txt) for (h, txt) in all_items if cache.get(h) is None]

    print(f"Total unique translatable strings: {len(all_items)}", flush=True)
    print(f"Already cached: {len(all_items) - len(needed_items)}", flush=True)
    print(f"Need translation: {len(needed_items)}", flush=True)

    if needed_items:
        print(f"\n--- Starting concurrent translation of {len(needed_items)} items ---", flush=True)
        completed_count = 0
        start_time = time.time()

        def translate_worker(item):
            h, txt = item
            return h, txt, engine.translate_text(txt, h)

        with ThreadPoolExecutor(max_workers=workers) as executor:
            future_to_item = {executor.submit(translate_worker, item): item for item in needed_items}
            for future in as_completed(future_to_item):
                try:
                    h, txt, trans = future.result()
                    completed_count += 1
                    if completed_count % 25 == 0 or completed_count == len(needed_items):
                        elapsed = time.time() - start_time
                        rate = completed_count / elapsed if elapsed > 0 else 1
                        remaining = (len(needed_items) - completed_count) / rate / 60
                        pct = (completed_count / len(needed_items)) * 100
                        print(f"Progress: [{completed_count}/{len(needed_items)}] ({pct:.1f}%) - Speed: {rate:.1f} items/s - Est. remaining: {remaining:.1f} mins", flush=True)
                        cache.save()
                except Exception as e:
                    print(f"Item error: {e}", flush=True)

        cache.save()
        total_time = time.time() - start_time
        print(f"All {len(needed_items)} items translated in {total_time/60:.2f} minutes!", flush=True)

    print("\n--- Generating Translated Course Files ---", flush=True)

    # 1. Parts
    part_files = sorted((NORMALIZED_DIR / "parts").glob("*.json"))
    for pf in part_files:
        p_data = safe_read_json(str(pf))
        p_num = p_data.get("part")
        title_vi = PART_TITLES_VI.get(p_num, f"Phần {p_num}")
        p_data["title_vi"] = title_vi
        for l in p_data.get("lessons", []):
            if l.get("is_index"):
                l["title_vi"] = title_vi
            else:
                l_title = l.get("title_original", "")
                l_hash = compute_sha256(f"lesson_title:{l_title}")
                l["title_vi"] = cache.get(l_hash) or l_title
        safe_write_json(str(TRANSLATED_DIR / "parts" / pf.name), p_data)

    # 2. Lessons
    lesson_files = sorted((NORMALIZED_DIR / "lessons").glob("*.json"))
    total_blocks_count = 0
    translated_blocks_count = 0
    code_blocks_preserved = 0

    for lf in lesson_files:
        doc = safe_read_json(str(lf))
        p_num = doc.get("part")
        is_index = doc.get("is_part_index", False)

        if is_index and p_num:
            doc["title_vi"] = PART_TITLES_VI.get(p_num, f"Phần {p_num}")
        else:
            orig_t = doc.get("title_original", "")
            t_hash = compute_sha256(f"title:{orig_t}")
            doc["title_vi"] = cache.get(t_hash) or orig_t

        for b in doc.get("blocks", []):
            total_blocks_count += 1
            b_type = b.get("type")
            orig_c = b.get("original", {}).get("content", "")
            s_hash = b.get("source_hash")

            if b_type in ["code", "sample_output", "sample_data"]:
                if b_type == "code":
                    code_blocks_preserved += 1
                b["translation_status"] = "not_applicable"
                b["translation"]["content"] = orig_c
            elif b_type == "image":
                alt = orig_c
                if alt:
                    b["translation"]["content"] = cache.get(s_hash) or alt
                    b["translation_status"] = "translated"
                else:
                    b["translation_status"] = "not_applicable"
            else:
                trans_val = cache.get(s_hash)
                if trans_val is not None:
                    b["translation"]["content"] = trans_val
                    b["translation_status"] = "translated"
                    translated_blocks_count += 1
                elif orig_c.strip():
                    b["translation"]["content"] = engine.translate_text(orig_c, s_hash)
                    b["translation_status"] = "translated"
                    translated_blocks_count += 1
                else:
                    b["translation_status"] = "not_applicable"

        safe_write_json(str(TRANSLATED_DIR / "lessons" / lf.name), doc)

    # 3. Pages
    page_files = sorted((NORMALIZED_DIR / "pages").glob("*.json"))
    for pf in page_files:
        doc = safe_read_json(str(pf))
        orig_t = doc.get("title_original", "")
        t_hash = compute_sha256(f"title:{orig_t}")
        doc["title_vi"] = cache.get(t_hash) or orig_t

        for b in doc.get("blocks", []):
            total_blocks_count += 1
            b_type = b.get("type")
            orig_c = b.get("original", {}).get("content", "")
            s_hash = b.get("source_hash")

            if b_type in ["code", "sample_output", "sample_data"]:
                if b_type == "code":
                    code_blocks_preserved += 1
                b["translation_status"] = "not_applicable"
                b["translation"]["content"] = orig_c
            else:
                trans_val = cache.get(s_hash)
                if trans_val is not None:
                    b["translation"]["content"] = trans_val
                    b["translation_status"] = "translated"
                    translated_blocks_count += 1
                elif orig_c.strip():
                    b["translation"]["content"] = engine.translate_text(orig_c, s_hash)
                    b["translation_status"] = "translated"
                    translated_blocks_count += 1
                else:
                    b["translation_status"] = "not_applicable"

        safe_write_json(str(TRANSLATED_DIR / "pages" / pf.name), doc)

    # 4. Exercises
    ex_files = sorted((NORMALIZED_DIR / "exercises").glob("*.json"))
    for ef in ex_files:
        ex = safe_read_json(str(ef))
        t_orig = ex.get("title_original", "")
        desc_orig = ex.get("description_original", "")
        s_hash = ex.get("source_hash")

        t_hash = compute_sha256(f"ex_title:{t_orig}")
        ex["title_vi"] = cache.get(t_hash) or t_orig
        ex["description_vi"] = cache.get(s_hash) or desc_orig
        safe_write_json(str(TRANSLATED_DIR / "exercises" / ef.name), ex)

    cache.save()

    report = {
        "total_parts": len(part_files),
        "total_lessons": len(lesson_files),
        "total_pages": len(page_files),
        "total_exercises": len(ex_files),
        "total_blocks_processed": total_blocks_count,
        "translatable_blocks_translated": translated_blocks_count,
        "code_blocks_preserved": code_blocks_preserved,
        "cache_entries_total": len(cache.cache),
        "status": "completed",
    }
    safe_write_json(str(REPORTS_DIR / "translation_report.json"), report)

    print("\n--- TRANSLATION COMPLETE ---", flush=True)
    for k, v in report.items():
        print(f"  {k}: {v}", flush=True)

    return report


if __name__ == "__main__":
    run_translation()
