import Link from 'next/link';
import { Home, BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-[#0a0f1e]">
      <div className="max-w-md w-full text-center space-y-5 p-8 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] shadow-xl animate-fade-in">
        <div className="w-14 h-14 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto text-xl font-black font-mono">
          404
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Không tìm thấy trang
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Trang bạn truy cập có thể đã được thay đổi hoặc không tồn tại.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/course"
            className="w-full sm:w-auto btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs"
          >
            <BookOpen className="w-4 h-4" />
            <span>Khóa học</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto btn-secondary inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs"
          >
            <Home className="w-4 h-4" />
            <span>Trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
