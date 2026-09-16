import type { Metadata } from 'next';
import { BookOpen, Sparkles, Terminal } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Giới thiệu về PYTHON-MASTER',
  description:
    'Giới thiệu nền tảng học lập trình Python toàn diện tiếng Việt PYTHON-MASTER xây dựng bởi MaiTamDev.',
};

export default function AboutPage() {
  return (
    <div className="flex-1 py-12 md:py-16 bg-slate-50/50 dark:bg-[#090d16]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
            <span>Nền tảng Lập trình Python Tiếng Việt</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Về nền tảng PYTHON-MASTER
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Sứ mệnh mang chương trình đào tạo lập trình Python bài bản, trực quan và thực chiến nhất đến với cộng đồng người học Việt Nam.
          </p>
        </div>

        {/* Creator Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-sky-500/10 via-indigo-500/5 to-transparent border border-sky-500/30 space-y-3">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-sm">
            <Sparkles className="w-5 h-5" />
            <span>Xây dựng & Phát triển</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Website và toàn bộ nền tảng <strong>PYTHON-MASTER</strong> được thiết kế, xây dựng và phát triển bởi <strong>MaiTamDev</strong>.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Mục tiêu là tạo ra một môi trường học lập trình không rào cản: người học có thể mở web lên và bắt đầu viết code ngay lập tức, không cần cài đặt phần mềm phức tạp, có bài tập chấm tự động và trợ lý AI hướng dẫn tận tâm.
          </p>
        </div>

        {/* Platform Highlights */}
        <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Các tính năng nổi bật của nền tảng
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                <BookOpen className="w-4 h-4 text-sky-500" />
                <span>14 Phần học • 78 Bài học</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Lộ trình từ biến, vòng lặp, hàm đến Lập trình hướng đối tượng (OOP), đệ quy và cấu trúc dữ liệu.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                <Terminal className="w-4 h-4 text-emerald-500" />
                <span>283 Bài tập chấm tự động</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Trình biên dịch Pyodide WebAssembly chạy mã trực tiếp trên trình duyệt, nộp bài kiểm tra test case ngay lập tức.
              </p>
            </div>
          </div>

          <p>
            Toàn bộ tiến độ, ghi chú bài học và dấu trang được lưu trữ an toàn ngay trên trình duyệt của bạn (localStorage), hỗ trợ xuất và nhập file sao lưu linh hoạt.
          </p>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center">
          Website do <strong>MaiTamDev</strong> xây dựng và phát triển.
        </div>
      </div>
    </div>
  );
}
