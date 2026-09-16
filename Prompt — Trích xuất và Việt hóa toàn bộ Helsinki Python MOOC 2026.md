# NHIỆM VỤ: TRÍCH XUẤT VÀ VIỆT HÓA TOÀN BỘ PYTHON PROGRAMMING MOOC 2026

Bạn là Senior Python Engineer, Data Engineer và Technical Localization Engineer.

Nhiệm vụ của bạn là lấy TOÀN BỘ dữ liệu khóa học Python Programming MOOC 2026 của University of Helsinki từ repository chính thức:

https://github.com/rage/programming-26

Sau đó:

1. Clone đầy đủ repository.
2. Kiểm kê toàn bộ dữ liệu khóa học.
3. Trích xuất đầy đủ nội dung học.
4. Chuẩn hóa dữ liệu.
5. Dịch toàn bộ nội dung học sang tiếng Việt có dấu, tự nhiên, chính xác về thuật ngữ lập trình.
6. Giữ nguyên tuyệt đối những thành phần kỹ thuật không được phép thay đổi.
7. Tạo dataset hoàn chỉnh để sau này import vào Supabase và xây website học Python tiếng Việt.
8. Không được bỏ sót bài học, bài tập, ví dụ, hình ảnh, metadata hoặc thành phần liên quan.
9. Phải có cơ chế kiểm tra tự động nhằm phát hiện dữ liệu thiếu hoặc dữ liệu bị hỏng sau quá trình dịch.

---

# I. NGUỒN DỮ LIỆU

Repository chính thức:

```text
https://github.com/rage/programming-26
```

Clone bằng Git, KHÔNG scrape website nếu dữ liệu tương ứng đã có trong repository.

Ví dụ:

```bash
git clone https://github.com/rage/programming-26.git
```

Sau khi clone:

- lưu Git commit SHA hiện tại;
- lưu branch;
- lưu thời điểm import;
- lưu repository URL;
- lưu thông tin license.

Không thay đổi repository gốc.

Repository gốc chỉ được sử dụng như immutable source.

---

# II. MỤC TIÊU CUỐI CÙNG

Tôi muốn nhận được một dataset tiếng Việt hoàn chỉnh tương ứng với toàn bộ khóa học.

Kết quả cuối nên có dạng:

```text
python-mooc-vietnamese/
│
├── source/
│   └── programming-26/
│
├── data/
│   ├── raw/
│   ├── normalized/
│   ├── translated/
│   ├── reviewed/
│   └── manifests/
│
├── assets/
│   ├── images/
│   ├── diagrams/
│   └── other/
│
├── glossary/
│   └── python_vi.json
│
├── scripts/
│   ├── inventory.py
│   ├── extract.py
│   ├── normalize.py
│   ├── translate.py
│   ├── validate.py
│   └── export.py
│
├── reports/
│   ├── inventory.json
│   ├── translation_report.json
│   ├── validation_report.json
│   └── missing_content.json
│
├── course.json
├── LICENSE_SOURCE.md
└── README.md
```

Có thể điều chỉnh cấu trúc nếu repository thực tế yêu cầu, nhưng phải giữ nguyên các tầng:

```text
SOURCE
↓
RAW
↓
NORMALIZED
↓
TRANSLATED
↓
VALIDATED
↓
EXPORT
```

---

# III. PHASE 1 — CLONE VÀ SOURCE SNAPSHOT

Clone repository:

```text
rage/programming-26
```

Tạo metadata:

```json
{
  "source_repository": "https://github.com/rage/programming-26",
  "branch": "...",
  "commit_sha": "...",
  "imported_at": "...",
  "course": "Python Programming MOOC 2026",
  "organization": "University of Helsinki",
  "source_license": "..."
}
```

Không được giả định cấu trúc repository.

Phải đọc repository thực tế trước.

---

# IV. PHASE 2 — INVENTORY TOÀN BỘ REPOSITORY

Quét toàn bộ repository.

Xác định:

```text
Markdown
MDX
JSON
YAML
JavaScript
TypeScript
images
SVG
video references
exercise definitions
quiz definitions
code examples
metadata
frontmatter
custom tags
custom components
links
attachments
assets
```

Đặc biệt phân tích kỹ thư mục:

```text
data/
```

và tất cả thư mục/file mà nội dung trong `data/` tham chiếu tới.

Tạo:

```text
reports/inventory.json
```

Mỗi file cần có:

```json
{
  "path": "...",
  "extension": "...",
  "size": 0,
  "sha256": "...",
  "category": "...",
  "references": []
}
```

Tạo báo cáo thống kê:

```text
TOTAL FILES
TOTAL COURSE FILES
TOTAL PARTS
TOTAL LESSONS
TOTAL SECTIONS
TOTAL EXERCISES
TOTAL CODE BLOCKS
TOTAL IMAGES
TOTAL LINKS
TOTAL CUSTOM COMPONENTS
```

Không bắt đầu dịch trước khi inventory hoàn tất.

---

# V. KHÔNG ĐƯỢC BỎ SÓT DATA

Phải trích xuất đầy đủ:

- tên khóa học;
- Part;
- Chapter;
- Lesson;
- Section;
- Heading;
- Paragraph;
- List;
- Table;
- Note;
- Warning;
- Tip;
- Example;
- Code example;
- Expected output;
- Exercise;
- Exercise description;
- Exercise instruction;
- Hint;
- Quiz;
- Question;
- Answer option;
- Explanation;
- image;
- image caption;
- image alt;
- metadata;
- navigation;
- prerequisite nếu có;
- link liên quan;
- custom component;
- các tài nguyên liên quan khác.

Không được chỉ lấy text.

---

# VI. PHASE 3 — NORMALIZATION

Không lưu toàn bộ bài học dưới dạng một chuỗi Markdown khổng lồ duy nhất.

Phải parse nội dung thành cấu trúc dữ liệu.

Ví dụ:

```json
{
  "course": {},
  "parts": [],
  "lessons": []
}
```

Một lesson:

```json
{
  "id": "stable-id",
  "part": 1,
  "slug": "...",
  "title_original": "...",
  "title_vi": "...",
  "source_path": "...",
  "source_hash": "...",
  "order": 1,
  "blocks": []
}
```

---

# VII. CONTENT BLOCK SCHEMA

Chuẩn hóa bài học thành block.

Các loại block tối thiểu:

```text
heading
paragraph
list
table
quote
code
output
note
tip
warning
example
exercise
quiz
image
math
custom_component
```

Ví dụ:

```json
{
  "id": "block-xxx",
  "type": "paragraph",
  "order": 5,

  "original": {
    "language": "en",
    "content": "A variable stores..."
  },

  "translation": {
    "language": "vi",
    "content": "Biến được sử dụng để..."
  },

  "source_hash": "...",
  "translation_status": "translated"
}
```

---

# VIII. PHASE 4 — DỊCH SANG TIẾNG VIỆT

Dịch TOÀN BỘ nội dung dùng cho người học sang tiếng Việt.

Tiếng Việt phải:

- có dấu đầy đủ;
- đúng chính tả;
- đúng ngữ pháp;
- tự nhiên;
- dễ hiểu;
- không dịch máy cứng nhắc;
- phù hợp người mới học lập trình;
- chính xác về kiến thức Python;
- nhất quán thuật ngữ xuyên suốt toàn khóa học.

Không được tóm tắt.

Không được viết lại ngắn hơn nếu điều đó làm mất nội dung.

Không được tự thêm kiến thức không có trong source trừ khi được đánh dấu rõ là phần bổ sung.

Mục tiêu:

```text
Original meaning = Vietnamese meaning
```

---

# IX. QUY TẮC DỊCH THUẬT NGỮ

Tạo glossary trước khi dịch:

```text
glossary/python_vi.json
```

Ví dụ:

```json
{
  "variable": "biến",
  "function": "hàm",
  "parameter": "tham số",
  "argument": "đối số",
  "loop": "vòng lặp",
  "iteration": "lần lặp",
  "conditional": "câu lệnh điều kiện",
  "dictionary": "từ điển",
  "tuple": "tuple",
  "inheritance": "kế thừa",
  "encapsulation": "đóng gói",
  "recursion": "đệ quy",
  "exception": "ngoại lệ",
  "regular expression": "biểu thức chính quy"
}
```

Nếu thuật ngữ tiếng Anh thường được developer Việt Nam sử dụng rộng rãi, có thể viết dạng:

```text
tuple
generator
decorator
iterator
framework
library
```

hoặc:

```text
bộ sinh (generator)
bộ lặp (iterator)
```

khi xuất hiện lần đầu.

Không Việt hóa một cách gượng ép.

---

# X. NHỮNG THỨ TUYỆT ĐỐI KHÔNG ĐƯỢC DỊCH

Không tự ý đổi:

```text
Python keywords
function names
class names
method names
library names
module names
package names
variable names trong code
API names
file paths
URLs
Git commands
shell commands
JSON keys nếu chúng là dữ liệu kỹ thuật
HTML tags
Markdown syntax
custom component names
exercise identifiers
test identifiers
```

Ví dụ source:

```python
student_name = input("Name: ")
print(student_name)
```

KHÔNG được đổi:

```python
ten_sinh_vien = input("Tên: ")
print(ten_sinh_vien)
```

Tên biến:

```text
student_name
```

phải giữ nguyên.

---

# XI. STRING TRONG CODE

Với string literal nằm trong Python example:

```python
name = input("What is your name?")
```

Mặc định:

GIỮ NGUYÊN code gốc để bảo đảm độ tương thích.

Nếu muốn cung cấp bản hiển thị tiếng Việt, phải lưu tách biệt:

```json
{
  "original_code": "...",
  "localized_display_code": "..."
}
```

Nhưng:

```text
original_code
```

luôn phải được giữ nguyên.

Không được ghi đè source code.

---

# XII. CODE INTEGRITY

Mọi code block phải giữ:

```text
indentation
whitespace quan trọng
syntax
line breaks
language
content
```

Tạo SHA256 cho từng code block trước và sau translation.

Yêu cầu:

```text
original_code_hash == translated_dataset_original_code_hash
```

Nếu khác:

```text
VALIDATION FAILED
```

Không được publish block đó.

---

# XIII. LINK VÀ ASSET

Phải xử lý đầy đủ:

```text
images
SVG
relative links
absolute links
download files
diagrams
```

Copy asset cần thiết sang:

```text
assets/
```

nhưng lưu provenance:

```json
{
  "original_path": "...",
  "local_path": "...",
  "sha256": "..."
}
```

Không được làm hỏng relative path.

---

# XIV. EXERCISES

Mỗi exercise phải có dữ liệu riêng.

Ví dụ:

```json
{
  "id": "...",
  "lesson_id": "...",

  "title_original": "...",
  "title_vi": "...",

  "description_original": "...",
  "description_vi": "...",

  "starter_code": "...",

  "hints": [],

  "source_metadata": {},

  "order": 1
}
```

Nếu test case hoặc grading data nằm trong repository:

phải extract.

Nếu KHÔNG nằm trong repository:

KHÔNG được bịa.

Phải ghi:

```json
{
  "grading_data_available": false
}
```

và report rõ.

---

# XV. KHÔNG BỊA DỮ LIỆU

Tuyệt đối không tạo:

```text
fake exercises
fake solutions
fake tests
fake quiz answers
fake metadata
fake links
fake images
fake course sections
```

Nếu repository không chứa dữ liệu đó:

ghi rõ là không có.

---

# XVI. TRANSLATION PIPELINE

Không gửi toàn bộ file Markdown cực lớn vào model trong một request duy nhất.

Pipeline nên là:

```text
Markdown
↓
Parser
↓
AST / content blocks
↓
Select translatable blocks
↓
Translation
↓
Validation
↓
Reconstruction
```

Dịch theo block hoặc nhóm block hợp lý.

---

# XVII. TRANSLATION CACHE

Không dịch lại nội dung không thay đổi.

Cache dựa trên:

```text
source_hash
```

Ví dụ:

```json
{
  "source_hash": "...",
  "translated_hash": "...",
  "translation": "..."
}
```

Nếu:

```text
source_hash unchanged
```

thì reuse translation.

---

# XVIII. STATUS CỦA TRANSLATION

Mỗi block phải có:

```text
pending
translated
validated
needs_review
reviewed
failed
```

Ví dụ:

```json
{
  "translation_status": "validated"
}
```

---

# XIX. VALIDATION TỰ ĐỘNG

Viết:

```text
scripts/validate.py
```

Phải kiểm tra tối thiểu:

```text
lesson count original == normalized
exercise count original == translated
code block count original == translated
code content unchanged
image references preserved
links preserved
heading structure preserved
custom components preserved
IDs unique
required fields exist
UTF-8 valid
JSON valid
```

---

# XX. KIỂM TRA PYTHON CODE

Đối với code block Python có thể compile độc lập:

dùng:

```python
compile(source, "<string>", "exec")
```

để kiểm tra syntax.

Không execute code nguy hiểm.

Nếu code không compile vì nó chỉ là snippet:

không đánh dấu lỗi sai một cách máy móc.

Ghi:

```text
syntax_check_skipped_reason
```

nếu cần.

---

# XXI. KIỂM TRA TIẾNG VIỆT

Phát hiện:

- text tiếng Anh còn sót trong phần cần dịch;
- lỗi encoding;
- ký tự mojibake;
- mất dấu;
- thuật ngữ không nhất quán.

Đặc biệt phát hiện lỗi kiểu:

```text
tiáº¿ng Viá»‡t
```

hoặc:

```text
l?p tr?nh
```

Output toàn bộ file phải là:

```text
UTF-8
```

---

# XXII. KHÔNG YÊU CẦU "100%" MỘT CÁCH GIẢ TẠO

Không được tự tuyên bố:

```text
Translation accuracy = 100%
```

nếu chưa kiểm tra.

Thay vào đó tạo các metric thực tế:

```text
Total blocks:
Translated blocks:
Validated blocks:
Failed blocks:
Needs review:
Code blocks preserved:
Missing assets:
Untranslated candidate strings:
```

Mục tiêu là đạt:

```text
0 missing required course files
0 altered original code blocks
0 broken asset references
0 invalid JSON
0 duplicate IDs
0 encoding errors
0 known untranslated learner-facing blocks
```

---

# XXIII. VIETNAMESE REVIEW PASS

Sau dịch lần đầu, chạy thêm một pass chuyên kiểm tra:

```text
Technical correctness
Vietnamese grammar
Vietnamese naturalness
Terminology consistency
Meaning preservation
No hallucination
No missing information
```

Nếu phát hiện lỗi:

sửa translation.

Không sửa source.

---

# XXIV. OUTPUT HAI NGÔN NGỮ

Luôn giữ:

```text
original English
+
Vietnamese translation
```

Ví dụ:

```json
{
  "title_original": "Variables",
  "title_vi": "Biến"
}
```

Không được xóa tiếng Anh gốc khỏi dataset.

---

# XXV. STABLE IDS

Không dùng Vietnamese title làm ID.

Sai:

```text
id = "bien-trong-python"
```

nếu ID phụ thuộc bản dịch.

Nên dùng:

```text
source path
source identifier
hash
stable slug
```

để translation có thể thay đổi mà ID không đổi.

---

# XXVI. COURSE EXPORT

Cuối pipeline phải tạo một canonical dataset.

Ví dụ:

```text
data/export/
│
├── course.json
├── parts/
│   ├── part-01.json
│   ├── part-02.json
│   ├── ...
│   └── part-14.json
│
├── lessons/
├── exercises/
└── manifest.json
```

`course.json` chứa metadata tổng thể.

---

# XXVII. CHUẨN BỊ CHO SUPABASE

Dataset cần thiết kế để sau này map dễ dàng vào:

```text
courses
modules
lessons
lesson_blocks
exercises
exercise_tests
assets
source_snapshots
translation_versions
```

NHƯNG:

chưa cần kết nối Supabase trong nhiệm vụ hiện tại.

Giai đoạn này tập trung:

```text
EXTRACT
NORMALIZE
TRANSLATE
VALIDATE
EXPORT
```

---

# XXVIII. LICENSE / ATTRIBUTION

Không được xóa:

```text
copyright
license information
source information
```

Tạo file:

```text
LICENSE_SOURCE.md
```

ghi rõ:

```text
Original course:
Python Programming MOOC 2026

University of Helsinki
Department of Computer Science

Source:
https://github.com/rage/programming-26

Adaptation:
Vietnamese translation and data normalization.

Original course material remains subject to its original license.
```

Đọc LICENSE/README thực tế trong repository trước khi ghi chi tiết cuối cùng.

Không được tự đoán license nếu source nói khác.

---

# XXIX. README

Tạo README mô tả:

```text
nguồn dữ liệu
commit source
pipeline
cấu trúc dataset
cách chạy scripts
cách translate
cách validate
cách export
license
known limitations
```

---

# XXX. SCRIPT CLI

Tôi muốn có thể chạy:

```bash
python scripts/inventory.py
python scripts/extract.py
python scripts/normalize.py
python scripts/translate.py
python scripts/validate.py
python scripts/export.py
```

Nếu phù hợp, thêm command:

```bash
python pipeline.py all
```

để chạy toàn bộ.

---

# XXXI. RESUMABLE PIPELINE

Nếu translation dừng giữa chừng:

không bắt đầu lại từ đầu.

Pipeline phải biết block nào đã xong.

Ví dụ:

```text
Translated: 4,220
Remaining: 1,104
```

Chạy lại sẽ tiếp tục.

---

# XXXII. LOGGING

Tạo log có cấu trúc:

```text
logs/
```

Theo dõi:

```text
file
lesson
block
status
error
retry
model
timestamp
```

Không log API key.

---

# XXXIII. ERROR HANDLING

Một file lỗi không được làm mất toàn bộ tiến trình.

Ví dụ:

```text
Part 8 lesson X failed
```

pipeline:

```text
record error
continue remaining files
generate failed-items report
```

Sau đó có thể retry riêng.

---

# XXXIV. BACKUP NGUYÊN BẢN

Không bao giờ overwrite:

```text
source/programming-26/
```

Raw data cũng không overwrite bằng translation.

Phải luôn có:

```text
source
raw
normalized
translated
```

riêng biệt.

---

# XXXV. BẮT BUỘC KIỂM TRA THỰC TẾ REPOSITORY

Trước khi code parser:

hãy đọc:

```text
README
LICENSE
package configuration
data directory
custom Markdown syntax
custom React/Gatsby components nếu có
exercise integrations
```

Không được viết parser dựa trên phỏng đoán.

Nếu source có component dạng:

```text
<Exercise ...>
...
</Exercise>
```

phải xử lý đúng component thực tế.

---

# XXXVI. KHÔNG XÓA CUSTOM COMPONENT

Nếu gặp cú pháp không hiểu:

KHÔNG bỏ qua.

Lưu nguyên:

```json
{
  "type": "custom_component",
  "component_name": "...",
  "raw_source": "...",
  "parsed": false
}
```

và đưa vào report.

Mục tiêu:

```text
NO DATA LOSS
```

---

# XXXVII. ACCEPTANCE CRITERIA

Nhiệm vụ chỉ được xem là hoàn thành khi:

```text
Repository đã được clone đầy đủ.

Source commit được ghi nhận.

Toàn bộ course files đã được inventory.

Toàn bộ Parts được phát hiện.

Toàn bộ lessons được extract.

Toàn bộ learner-facing English content đã có Vietnamese translation hoặc được ghi rõ lý do chưa thể dịch.

Original English vẫn được giữ.

Toàn bộ code gốc được giữ nguyên.

Exercise data không bị mất.

Asset references không bị hỏng.

Custom components không bị silently discarded.

JSON hợp lệ.

UTF-8 hợp lệ.

Không có duplicate IDs.

Validation report được tạo.

Missing content report được tạo.

Translation report được tạo.

Dataset có thể sử dụng làm nguồn import Supabase.
```

---

# XXXVIII. REPORT CUỐI CÙNG

Sau khi hoàn thành, không chỉ nói:

```text
Done
```

Hãy báo cáo:

```text
SOURCE COMMIT

TOTAL FILES

TOTAL PARTS

TOTAL LESSONS

TOTAL CONTENT BLOCKS

TOTAL EXERCISES

TOTAL CODE BLOCKS

TOTAL IMAGES

TOTAL TRANSLATABLE BLOCKS

TRANSLATED

VALIDATED

NEEDS REVIEW

FAILED

UNTRANSLATED

MISSING ASSETS

BROKEN LINKS

CUSTOM COMPONENTS NOT FULLY PARSED

OUTPUT DIRECTORY
```

Sau đó liệt kê mọi vấn đề còn tồn tại.

---

# XXXIX. QUY TẮC LÀM VIỆC

Không dừng lại sau khi phân tích.

Không chỉ đưa kế hoạch.

Không tạo pseudo-code thay cho implementation.

Không tạo mock data.

Không bỏ qua dữ liệu khó parse.

Không tự ý giản lược nội dung.

Không tự ý viết lại code examples.

Không tự ý sửa exercise.

Không xóa metadata không hiểu.

Không tuyên bố hoàn thành nếu validation chưa pass.

Hãy thực hiện công việc trực tiếp trong repository/project workspace.

---

# XL. ƯU TIÊN

Thứ tự ưu tiên:

```text
1. DATA INTEGRITY
2. NO DATA LOSS
3. CODE PRESERVATION
4. TRANSLATION ACCURACY
5. TERMINOLOGY CONSISTENCY
6. REPRODUCIBILITY
7. PERFORMANCE
```

Nếu có xung đột giữa việc "dịch đẹp" và "giữ đúng ý nghĩa kỹ thuật":

ưu tiên độ chính xác kỹ thuật.

---

# XLI. KẾT QUẢ TÔI MUỐN

Tôi muốn sau khi bạn hoàn thành có thể lấy thư mục:

```text
data/export/
```

và ở bước tiếp theo xây importer để đưa toàn bộ khóa học vào Supabase mà KHÔNG phải quay lại scrape, dịch hoặc xử lý thủ công từ đầu.

Dataset phải là nền móng production-grade cho một website học Python hoàn toàn bằng tiếng Việt.

BẮT ĐẦU BẰNG VIỆC CLONE REPOSITORY, ĐỌC README/LICENSE, INVENTORY TOÀN BỘ `data/`, SAU ĐÓ MỚI THIẾT KẾ PARSER DỰA TRÊN CẤU TRÚC THỰC TẾ.

KHÔNG HỎI LẠI TÔI CÁC CÂU HỎI CÓ THỂ TỰ XÁC ĐỊNH TỪ REPOSITORY.

HÃY THỰC HIỆN TOÀN BỘ PIPELINE CHO ĐẾN KHI DATASET ĐƯỢC TẠO VÀ VALIDATION HOÀN TẤT.