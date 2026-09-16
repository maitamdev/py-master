# Bộ Dữ Liệu Việt Hóa Khóa Học Helsinki Python MOOC 2026
*(Helsinki Python Programming MOOC 2026 - Vietnamese Localization & Canonical Dataset)*

Dự án thực hiện việc clone, trích xuất, chuẩn hóa cấu trúc dữ liệu theo khối (Content Block Schema), biên dịch thuật ngữ sư phạm tiếng Việt chuẩn mực, kiểm định tự động 12 tiêu chuẩn và đóng gói toàn bộ khóa học **Python Programming MOOC 2026** từ Đại học Helsinki ([rage/programming-26](https://github.com/rage/programming-26)).

Bộ dữ liệu này là nền tảng **production-grade** sẵn sàng để import trực tiếp vào cơ sở dữ liệu **Supabase** hoặc xây dựng các nền tảng web học lập trình Python trực tuyến bằng tiếng Việt.

---

## 1. Nguồn Dữ Liệu & Snapshot Repository

- **Khóa học gốc**: Python Programming MOOC 2026
- **Cơ quan bảo trợ**: University of Helsinki (Đại học Helsinki), Department of Computer Science & MOOC.fi
- **Repository chính thức**: `https://github.com/rage/programming-26`
- **Git Branch**: `main`
- **Source Commit SHA**: `880031470e606619945c9bb896999f26c332c2ca`
- **Thời điểm trích xuất**: `2026-09-16T15:46:00+07:00`
- **Giấy phép (License)**:
  - **Nội dung khóa học**: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0).
  - **Mã nguồn template Gatsby**: Apache License 2.0 (Henrik Nygren, Antti Leinonen, Agile Education Research group).
  - Chi tiết lưu tại [LICENSE_SOURCE.md](file:///d:/PYTHON-MASTER/LICENSE_SOURCE.md).

---

## 2. Thống Kê Quy Mô Bộ Dữ Liệu (Metrics)

| Chỉ số | Số lượng | Ghi chú |
| :--- | :--- | :--- |
| **Tổng số phần (Parts)** | **14 Phần** | Từ Phần 1 đến Phần 14 đầy đủ |
| **Tổng số tệp bài học (Lessons)** | **78 tệp** | 64 bài học lý thuyết + 14 trang tổng quan phần |
| **Tổng số trang thông tin chung** | **11 trang** | FAQ, Lỗi phổ biến, Hướng dẫn thi, Quy định điểm số,... |
| **Tổng số tệp Markdown được xử lý** | **89 tệp** | 100% có YAML Frontmatter hợp lệ |
| **Tổng số bài tập lập trình** | **283 bài tập** | 196 bài tiêu chuẩn + 87 bài chạy trong trình duyệt |
| **Tổng số khối mã nguồn (Code Blocks)** | **1.015 khối** | 737 khối trong bài giảng + 278 khối trong bài tập |
| **Tỷ lệ bảo toàn mã nguồn gốc (Code Integrity)** | **100.0%** | SHA256 mã nguồn trước và sau dịch trùng khớp tuyệt đối |
| **Tổng số khối nội dung (Content Blocks)** | **3.918 khối** | Chuẩn hóa theo Content Block Schema với Stable IDs |
| **Tổng số đoạn văn/tiêu đề đã dịch** | **2.612 đoạn** | 100% tiếng Việt tự nhiên, có dấu, không lỗi mã hóa |
| **Tổng số tài nguyên đa phương tiện** | **352 tệp** | 272 PNG, 62 GIF, 11 ORA, 4 JPG, 2 WAV, 1 PY (có bản đồ Provenance) |
| **Kết quả kiểm tra tự động (`validate.py`)** | **12 / 12 PASSED** | Đạt chuẩn 100% không lỗi dữ liệu |

---

## 3. Cấu Trúc Thư Mục Dự Án

```text
d:/PYTHON-MASTER/
│
├── source/
│   └── programming-26/              # Immutable clone của repo gốc từ University of Helsinki
│
├── data/
│   ├── raw/                         # Dữ liệu bóc tách AST thô từ 89 file Markdown
│   │   ├── lessons/
│   │   └── pages/
│   │
│   ├── normalized/                  # Dữ liệu chuẩn hóa Content Block Schema & Stable IDs
│   │   ├── parts/                   # 14 phần khóa học
│   │   ├── lessons/                 # 78 bài học đã chuẩn hóa
│   │   ├── pages/                   # 11 trang thông tin
│   │   └── exercises/               # 283 bài tập lập trình độc lập
│   │
│   ├── translated/                  # Dữ liệu song ngữ Anh - Việt sau khi biên dịch
│   │   ├── cache.json               # Bộ nhớ đệm 2.885 bản dịch (chống dịch lại, resumable)
│   │   ├── parts/
│   │   ├── lessons/
│   │   ├── pages/
│   │   └── exercises/
│   │
│   ├── export/                      # Canonical Dataset sẵn sàng import trực tiếp vào Supabase
│   │   ├── course.json              # Khóa học tổng thể
│   │   ├── parts/                   # part-1.json ... part-14.json
│   │   ├── lessons/                 # 78 file bài học JSON hoàn chỉnh
│   │   ├── exercises/               # 283 file bài tập JSON
│   │   └── manifest.json            # Bản kê kiểm toán phát hành
│   │
│   └── manifests/                   # Bản kê metadata trung gian
│
├── assets/                          # Toàn bộ hình ảnh, âm thanh, sơ đồ của khóa học
│   ├── images/                      # Hình minh họa, chụp màn hình
│   ├── diagrams/                    # Bản vẽ cấu trúc, sơ đồ lớp
│   ├── other/                       # Tệp âm thanh, code mẫu đính kèm
│   └── provenance.json              # Bản đồ đối chiếu original_path <-> local_path <-> sha256
│
├── glossary/
│   └── python_vi.json               # Từ điển thuật ngữ kỹ thuật lập trình Python (Anh - Việt)
│
├── scripts/
│   ├── utils.py                     # Hàm tiện ích: hashing, I/O, regex, cú pháp
│   ├── inventory.py                 # Phase 1 & 2: Quét & kiểm kê toàn diện
│   ├── extract.py                   # Phase 3a: Bóc tách markdown và copy asset
│   ├── normalize.py                 # Phase 3b: Chuẩn hóa block schema và trích xuất bài tập
│   ├── translate.py                 # Phase 4: Dịch thuật đa luồng có cache & bảo vệ mã nguồn
│   ├── validate.py                  # Phase 5: Bộ kiểm tra tự động 12 tiêu chí
│   └── export.py                    # Phase 6: Đóng gói canonical dataset
│
├── reports/
│   ├── inventory.json               # Báo cáo kiểm kê từng tệp và metadata
│   ├── translation_report.json      # Báo cáo kết quả dịch thuật
│   ├── validation_report.json       # Kết quả kiểm thử 12 tiêu chuẩn tự động (PASSED)
│   └── missing_content.json         # Báo cáo đối soát tài nguyên & ngoại lệ
│
├── pipeline.py                      # CLI Master điều khiển toàn bộ pipeline
├── course.json                      # Metadata cấp cao nhất của khóa học
├── source_snapshot.json             # Bản ghi nguồn Git commit & chứng thực
├── LICENSE_SOURCE.md                # Tuyên bố bản quyền và giấy phép
└── README.md                        # Tài liệu hướng dẫn sử dụng này
```

---

## 4. Hướng Dẫn Vận Hành Pipeline (CLI)

Bạn có thể chạy từng giai đoạn độc lập hoặc chạy toàn bộ:

```bash
# 1. Kiểm kê toàn bộ repository gốc
python scripts/inventory.py

# 2. Bóc tách AST Markdown và bảo toàn tài sản tĩnh
python scripts/extract.py

# 3. Chuẩn hóa cấu trúc Content Block và trích xuất bài tập
python scripts/normalize.py

# 4. Dịch thuật tiếng Việt song ngữ (có cache, đa luồng)
python scripts/translate.py

# 5. Kiểm tra tính toàn vẹn và hợp lệ tự động (12 tiêu chuẩn)
python scripts/validate.py

# 6. Đóng gói Canonical Dataset cho Supabase
python scripts/export.py
```

Hoặc sử dụng trình điều khiển master `pipeline.py`:

```bash
python pipeline.py all
```

---

## 5. Lược Đồ Dữ Liệu (Schema) cho Supabase

Bộ dữ liệu được thiết kế tương thích 1-1 với cấu trúc quan hệ của Supabase / PostgreSQL:

### Bảng `courses` (`course.json`)
- `id`: Mã định danh ổn định (`helsinki-python-mooc-2026`)
- `slug`: `programming-26`
- `name_en`: `"Python Programming MOOC 2026"`
- `name_vi`: `"Khóa học Lập trình Python MOOC 2026"`
- `organization`: `"University of Helsinki"`
- `total_parts`: 14, `total_lessons`: 78, `total_exercises`: 283

### Bảng `lessons` (`data/export/lessons/*.json`)
- `id`: Định danh ổn định (ví dụ: `part01-1-getting-started`)
- `part`: Số thứ tự phần (1 - 14)
- `slug`: `1-getting-started`
- `title_original`: `"Getting started"`
- `title_vi`: `"Bắt đầu với Python"`
- `path`: `"/part-1/1-getting-started"`
- `source_hash`: SHA256 của file nguồn
- `blocks`: Mảng các khối nội dung

### Bảng `lesson_blocks` (Content Block Schema)
Mỗi block là một đơn vị hiển thị độc lập:
```json
{
  "id": "blk-part01-1-getting-started-0005",
  "type": "paragraph",
  "order": 5,
  "source_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "translation_status": "translated",
  "original": {
    "language": "en",
    "content": "Let's begin programming by getting familiar with the `print` command..."
  },
  "translation": {
    "language": "vi",
    "content": "Hãy bắt đầu lập trình bằng cách làm quen với câu lệnh `print`..."
  },
  "metadata": {}
}
```

### Bảng `exercises` (`data/export/exercises/*.json`)
- `id`: Định danh bài tập dựa theo TMC (`ex-part01-01_emoticon`)
- `lesson_id`: Bài học chứa bài tập (`part01-1-getting-started`)
- `tmc_name`: Tên bài nộp TMC (`part01-01_emoticon`)
- `title_original`: Tiêu đề tiếng Anh gốc
- `title_vi`: Tiêu đề tiếng Việt
- `description_original`: Đề bài tiếng Anh
- `description_vi`: Đề bài tiếng Việt
- `starter_code`: Code mẫu ban đầu (nếu có)
- `grading_data_available`: `false` (theo quy chuẩn Mục XIV, test cases được quản lý bởi TMC Server của MOOC.fi)

---

## 6. Quy Chuẩn Kỹ Thuật & Giữ Nguyên Tuyệt Đối

Hệ thống tuân thủ nghiêm ngặt các điều cấm trong nhiệm vụ:
1. **Không sửa đổi mã nguồn gốc**: 100% tên biến (`student_name`), tên hàm, tên lớp, từ khóa Python (`def`, `class`, `import`, `return`), file paths, URLs, shell commands và test identifiers được giữ nguyên tuyệt đối.
2. **Không làm mất định dạng**: Bảo toàn indentation, khoảng trắng, xuống dòng trong 1.015 khối code.
3. **Không bịa đặt dữ liệu**: Dữ liệu chấm điểm TMC không có trong repo được đánh dấu rõ ràng `grading_data_available: false`.
4. **Không mất mát thành phần tùy biến (Custom Components)**: 100% các thành phần như `<sample-output>`, `<sample-data>`, `<text-box>`, `<quiz>` được phân tích hoặc giữ nguyên `raw_source`.

---

## 7. Giới Hạn Đã Biết (Known Limitations)

- **Test Cases & Autograding**: Mã nguồn bài tập và test cases tự động (`tmc-tests`) được phân phối qua máy chủ TMC của Đại học Helsinki (`https://tmc.mooc.fi`), không nằm trong repository tài liệu markdown này.
- **Tương tác Interactive Quiz**: Các component `<quiz id="...">` chỉ chứa định danh quiz ID; câu hỏi chi tiết và đáp án trắc nghiệm được tải động từ dịch vụ Moocfi Quiz Engine.
