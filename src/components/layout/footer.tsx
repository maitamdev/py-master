import Link from 'next/link';
import { Code2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 transition-colors py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand and Description */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                <Code2 className="w-4 h-4" />
              </div>
              <span className="font-bold tracking-tight text-slate-900 dark:text-white text-base">
                PYTHON-MASTER
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              Nền tảng học lập trình Python toàn diện tiếng Việt từ cơ bản đến nâng cao. Thực hành 283 bài tập trực tiếp trên trình duyệt cùng công cụ hỗ trợ thông minh.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span>14 phần • 78 bài học • 283 bài tập thực hành</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Nội dung học tập
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/course" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Toàn bộ 14 phần học
                </Link>
              </li>
              <li>
                <Link href="/playground" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Python Playground
                </Link>
              </li>
              <li>
                <Link href="/ai-tutor" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Gia sư AI học tập
                </Link>
              </li>
              <li>
                <Link href="/progress" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Theo dõi tiến độ
                </Link>
              </li>
            </ul>
          </div>

          {/* About & Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Thông tin
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/about" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Giới thiệu nền tảng
                </Link>
              </li>
              <li>
                <Link href="/license" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href="/bookmarks" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Bài học đã lưu
                </Link>
              </li>
              <li>
                <Link href="/notes" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Ghi chú cá nhân
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>
            Website do <strong className="text-slate-700 dark:text-slate-300 font-semibold">MaiTamDev</strong> xây dựng và phát triển.
          </p>
          <p>
            © {new Date().getFullYear()} PYTHON-MASTER. Toàn bộ mã nguồn & giao diện được phát triển bởi MaiTamDev.
          </p>
        </div>
      </div>
    </footer>
  );
}
