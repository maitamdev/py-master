import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, HeartHandshake, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Điều khoản & Bản quyền (Terms & License) | PYTHON-MASTER',
  description:
    'Thông tin bản quyền và điều khoản sử dụng nền tảng học lập trình Python - PYTHON-MASTER.',
};

export default function LicensePage() {
  return (
    <div className="flex-1 py-12 md:py-16 bg-slate-50/50 dark:bg-[#090d16]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-3">
          <Link
            href="/course"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại khóa học</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Điều khoản & Bản quyền nền tảng
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Minh bạch điều khoản sử dụng và định hướng giáo dục mở của PYTHON-MASTER.
          </p>
        </div>

        {/* Platform Purpose & Open Access */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold">
            <BookOpen className="w-5 h-5" />
            <span>Mục tiêu & Bản quyền giáo dục</span>
          </div>
          <p>
            <strong>PYTHON-MASTER</strong> là nền tảng học lập trình trực tuyến mở được xây dựng và phát triển bởi <strong>MaiTamDev</strong>, nhằm mục đích phổ cập kiến thức lập trình Python chất lượng cao, hoàn toàn miễn phí cho cộng đồng người học và lập trình viên Việt Nam.
          </p>
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200">
            Mục đích phi thương mại • Giáo dục & Học tập cộng đồng (Non-Commercial Educational Platform)
          </div>
          <p>
            Mọi bài học, ví dụ, bài tập thực hành và công cụ tích hợp (Pyodide Python WASM, AI Tutor, Trình chấm điểm tự động) được thiết kế để phục vụ nhu cầu tự học, trau dồi kỹ năng tư duy logic và thuật toán cho cá nhân.
          </p>
        </div>

        {/* Terms of Use */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
            <ShieldCheck className="w-5 h-5" />
            <span>Điều khoản sử dụng (Terms of Use)</span>
          </div>
          <ul className="list-disc pl-5 space-y-2 text-xs">
            <li><strong>Miễn phí 100%:</strong> Toàn bộ 14 phần học và 283 bài tập được mở hoàn toàn miễn phí, không yêu cầu đóng phí hay đăng ký gói trả phí.</li>
            <li><strong>Bảo mật dữ liệu cá nhân:</strong> Tiến trình học tập, mã code thực hành và ghi chú được lưu trữ cục bộ trên trình duyệt của bạn (Local Storage) để bảo vệ quyền riêng tư tối đa.</li>
            <li><strong>Mục đích phi thương mại:</strong> Không sao chép để đóng gói bán lại dưới dạng thương mại khi chưa có sự đồng ý.</li>
            <li><strong>Chứng nhận hoàn thành:</strong> Chứng nhận hoàn thành trên nền tảng là chứng nhận ghi nhận nỗ lực học tập cá nhân do nền tảng PYTHON-MASTER phát hành.</li>
          </ul>
        </div>

        {/* Development Attribution */}
        <div className="p-5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Website do <strong>MaiTamDev</strong> xây dựng và phát triển vì cộng đồng người học Python Việt Nam.</span>
          </div>
          <span className="font-mono text-slate-500">© 2026 PYTHON-MASTER</span>
        </div>
      </div>
    </div>
  );
}
