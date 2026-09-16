'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import type { SearchResultItem } from '@/lib/course/client';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="flex-1 py-10 md:py-14 bg-slate-50/50 dark:bg-[#090d16]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mb-8 space-y-2 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Tìm kiếm khóa học
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tìm kiếm nhanh trong 14 phần, 78 bài học và 283 bài tập Python.
          </p>
        </div>

        {/* Search Box */}
        <div className="relative mb-8">
          <div className="flex items-center px-4 py-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm gap-3">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập từ khóa cần tìm (ví dụ: vòng lặp while, danh sách, def, class)..."
              className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none text-base"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Xóa
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {loading && (
            <div className="py-12 text-center text-sm text-slate-400">
              Đang tìm kiếm nội dung...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-12 text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500">
                Không tìm thấy kết quả nào cho &quot;{query}&quot;. Thử tìm với từ khóa chung hơn.
              </p>
            </div>
          )}

          {!loading &&
            results.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.path}
                className="block p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40">
                      {item.badge}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {item.title}
                    </h3>
                    {item.snippet && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {item.snippet}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-400">Đang tải trang tìm kiếm...</div>}>
      <SearchContent />
    </Suspense>
  );
}
