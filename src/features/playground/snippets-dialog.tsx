'use client';

import { X, Sparkles, ArrowRight } from 'lucide-react';

export interface Snippet {
  id: string;
  title: string;
  category: string;
  description: string;
  code: string;
}

export const PLAYGROUND_SNIPPETS: Snippet[] = [
  {
    id: 'guess-number',
    title: 'Game Đoán Số May Mắn',
    category: 'Trò chơi',
    description: 'Mô phỏng trò chơi đoán số từ 1 đến 100 với gợi ý lớn hơn / nhỏ hơn.',
    code: `# Game Đoán Số May Mắn
import random

bi_mat = random.randint(1, 50)
so_lan_doan = 0
print("=== TRÒ CHƠI ĐOÁN SỐ (1 ĐẾN 50) ===")
print(f"(Số bí mật đã được máy chủ chọn ngẫu nhiên!)")

# Giả lập 3 lượt đoán
cac_luot_doan = [25, 38, bi_mat]

for doan in cac_luot_doan:
    so_lan_doan += 1
    print(f"\\nLượt {so_lan_doan}: Người chơi đoán {doan}")
    if doan < bi_mat:
        print("-> Số bí mật LỚN HƠN!")
    elif doan > bi_mat:
        print("-> Số bí mật NHỎ HƠN!")
    else:
        print(f"-> CHÍNH XÁC! Bạn đã đoán đúng sau {so_lan_doan} lượt!")
        break
`,
  },
  {
    id: 'ascii-heart',
    title: 'Vẽ Trái Tim ASCII Art',
    category: 'Nghệ thuật & Toán',
    description: 'Sử dụng công thức toán học hàm ẩn để vẽ hình trái tim bằng ký tự trên màn hình console.',
    code: `# Vẽ Trái Tim ASCII bằng công thức toán học
for y in range(12, -12, -1):
    dong = ""
    for x in range(-30, 30):
        # Công thức đường cong trái tim: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
        x_scaled = x * 0.045
        y_scaled = y * 0.1
        f = (x_scaled**2 + y_scaled**2 - 1)**3 - (x_scaled**2) * (y_scaled**3)
        if f <= 0.0:
            dong += "♥"
        else:
            dong += " "
    print(dong)

print("\\n" + " " * 18 + "YÊU THÍCH LẬP TRÌNH PYTHON!")
`,
  },
  {
    id: 'caesar-cipher',
    title: 'Mã Hóa Caesar Cipher',
    category: 'Mật mã học',
    description: 'Mã hóa và giải mã chuỗi văn bản bằng thuật toán dịch chuyển ký tự kinh điển của Julius Caesar.',
    code: `# Thuật toán Mã hóa & Giải mã Caesar Cipher
def ma_hoa_caesar(van_ban, buoc_nhay=3):
    ket_qua = ""
    for char in van_ban:
        if char.isalpha():
            ascii_offset = ord('A') if char.isupper() else ord('a')
            ma_moi = (ord(char) - ascii_offset + buoc_nhay) % 26 + ascii_offset
            ket_qua += chr(ma_moi)
        else:
            ket_qua += char
    return ket_qua

def giai_ma_caesar(van_ban_ma_hoa, buoc_nhay=3):
    return ma_hoa_caesar(van_ban_ma_hoa, -buoc_nhay)

# Thử nghiệm
thong_diep = "Python is Amazing 2026!"
buoc_nhay = 5

ma_hoa = ma_hoa_caesar(thong_diep, buoc_nhay)
giai_ma = giai_ma_caesar(ma_hoa, buoc_nhay)

print(f"Thông điệp gốc:   {thong_diep}")
print(f"Sau khi mã hóa:   {ma_hoa}")
print(f"Sau khi giải mã:  {giai_ma}")
`,
  },
  {
    id: 'bubble-sort',
    title: 'Thuật Toán Sắp Xếp Nổi Bọt',
    category: 'Giải thuật',
    description: 'Trực quan hóa từng bước hoán đổi vị trí của danh sách số nguyên theo thứ tự tăng dần.',
    code: `# Thuật toán Bubble Sort (Sắp xếp nổi bọt)
def bubble_sort(arr):
    n = len(arr)
    buoc = 1
    print(f"Danh sách ban đầu: {arr}\\n")
    
    for i in range(n):
        da_hoan_doi = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                da_hoan_doi = True
                print(f"Bước {buoc}: Đổi chỗ {arr[j+1]} và {arr[j]} -> {arr}")
                buoc += 1
        if not da_hoan_doi:
            break
            
    return arr

du_lieu = [64, 34, 25, 12, 22, 11, 90]
ket_qua = bubble_sort(du_lieu)
print(f"\\nKết quả cuối cùng: {ket_qua}")
`,
  },
  {
    id: 'student-ranking',
    title: 'Thống Kê Điểm & Xếp Loại Học Lực',
    category: 'Xử lý Dữ liệu',
    description: 'Quản lý từ điển điểm sinh viên, tính điểm trung bình và xếp loại học lực xuất sắc, giỏi, khá.',
    code: `# Xử lý dữ liệu bảng điểm sinh viên
sinh_vien = [
    {"ten": "Nguyễn Văn An", "toan": 8.5, "van": 7.5, "anh": 9.0},
    {"ten": "Trần Thị Bình", "toan": 9.5, "van": 8.0, "anh": 8.5},
    {"ten": "Lê Hoàng Nam", "toan": 6.0, "van": 7.0, "anh": 6.5},
    {"ten": "Phạm Mai Linh", "toan": 9.0, "van": 9.0, "anh": 9.5},
]

print(f"{'HỌ VÀ TÊN':<20} | {'ĐIỂM TB':<8} | {'XẾP LOẠI'}")
print("-" * 45)

for sv in sinh_vien:
    dtb = round((sv['toan'] + sv['van'] + sv['anh']) / 3, 2)
    if dtb >= 9.0:
        xep_loai = "Xuất sắc"
    elif dtb >= 8.0:
        xep_loai = "Giỏi"
    elif dtb >= 6.5:
        xep_loai = "Khá"
    else:
        xep_loai = "Trung bình"
        
    print(f"{sv['ten']:<20} | {dtb:<8} | {xep_loai}")
`,
  },
];

export function SnippetsDialog({
  isOpen,
  onClose,
  onSelectSnippet,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectSnippet: (code: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5 text-sky-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Kho mã nguồn mẫu (Code Snippets Gallery)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Snippets list */}
        <div className="p-6 overflow-y-auto space-y-3">
          {PLAYGROUND_SNIPPETS.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/60 hover:border-sky-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/60">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                  {item.description}
                </p>
              </div>

              <button
                onClick={() => {
                  onSelectSnippet(item.code);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 self-start sm:self-center shrink-0 transition-all hover:gap-2"
              >
                <span>Nạp vào editor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
