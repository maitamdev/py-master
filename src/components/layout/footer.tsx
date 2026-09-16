import Link from 'next/link';
import { Code2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/60 dark:border-white/[0.06] bg-white dark:bg-[#0a0f1e] transition-colors py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                <Code2 className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold tracking-tight text-slate-900 dark:text-white text-sm">
                PYTHON-MASTER
              </span>
            </div>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              Nền tảng học lập trình Python toàn diện tiếng Việt. Chạy code trực tiếp trên trình duyệt, thực hành 283 bài tập và đồng hành cùng Gia sư AI.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                14 phần
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                78 bài học
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                283 bài tập
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Nội dung
            </h4>
            <ul className="space-y-2 text-[13px] text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/course" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Toàn bộ 14 phần học
                </Link>
              </li>
              <li>
                <Link href="/playground" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Python Playground
                </Link>
              </li>
              <li>
                <Link href="/ai-tutor" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Gia sư AI
                </Link>
              </li>
              <li>
                <Link href="/progress" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Theo dõi tiến độ
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Thông tin
            </h4>
            <ul className="space-y-2 text-[13px] text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/license" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Điều khoản
                </Link>
              </li>
              <li>
                <Link href="/bookmarks" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Bài học đã lưu
                </Link>
              </li>
              <li>
                <Link href="/notes" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Ghi chú
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200/60 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
          <p>
            Xây dựng và phát triển bởi <strong className="text-slate-600 dark:text-slate-300 font-semibold">MaiTamDev</strong>
          </p>
          <p>
            © {new Date().getFullYear()} PYTHON-MASTER
          </p>
        </div>
      </div>
    </footer>
  );
}
