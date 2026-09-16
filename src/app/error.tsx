'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App runtime error:', error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-[#0a0f1e]">
      <div className="max-w-md w-full text-center space-y-5 p-8 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] shadow-xl animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Đã xảy ra sự cố
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Hệ thống gặp lỗi không mong muốn. Bạn có thể thử tải lại hoặc quay về trang chủ.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Thử lại</span>
          </button>
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
