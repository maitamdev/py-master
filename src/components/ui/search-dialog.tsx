'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, BookOpen, Terminal, CheckCircle2, CornerDownLeft, Sparkles } from 'lucide-react';
import type { SearchResultItem } from '@/lib/course/client';

const QUICK_SUGGESTIONS = [
  'Vòng lặp while',
  'Hàm def',
  'Danh sách list',
  'Từ điển dictionary',
  'Class & OOP',
  'Đệ quy recursion',
  'Thao tác tệp tin',
  'Pygame',
];

export function SearchDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setSelectedIndex(0);
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle Keyboard Navigation (Escape, ArrowUp, ArrowDown, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
      } else if (e.key === 'Enter') {
        if (results.length > 0 && results[selectedIndex]) {
          e.preventDefault();
          const target = results[selectedIndex];
          onClose();
          router.push(target.path);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, results, selectedIndex, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Command Palette Input Header */}
        <div className="flex items-center px-5 py-4 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-sky-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm bài học, bài tập, thuật toán... (nhấn ↑↓ để chọn, Enter để vào)"
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none text-base font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results / Suggestions list */}
        <div className="overflow-y-auto p-3 space-y-1.5 flex-1">
          {loading && (
            <div className="py-12 text-center text-sm text-slate-400">
              <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Đang tìm kiếm trong toàn bộ giáo trình...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              Không tìm thấy kết quả phù hợp cho &quot;{query}&quot;.
            </div>
          )}

          {/* Quick Suggestions when input is empty */}
          {!loading && !query && (
            <div className="py-6 px-4 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Gợi ý tìm kiếm phổ biến</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => setQuery(sug)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950/60 dark:hover:text-sky-400 border border-slate-200/80 dark:border-slate-700/80 transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                Mẹo: Bạn có thể nhấn <kbd className="px-1.5 py-0.5 font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">Ctrl + K</kbd> hoặc <kbd className="px-1.5 py-0.5 font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">Ctrl + P</kbd> ở bất kỳ đâu để mở nhanh thanh điều hướng này.
              </p>
            </div>
          )}

          {/* Search Result Items */}
          {!loading &&
            results.map((item, idx) => {
              const isSelected = selectedIndex === idx;

              return (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => {
                    onClose();
                    router.push(item.path);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 group ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-sky-950/70 border border-sky-300/80 dark:border-sky-800'
                      : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div
                    className={`mt-0.5 p-2 rounded-xl shrink-0 ${
                      isSelected
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.type === 'exercise' ? (
                      <Terminal className="w-4 h-4" />
                    ) : item.type === 'part' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <BookOpen className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.badge}
                      </span>
                    </div>
                    <h4
                      className={`text-sm font-bold truncate transition-colors ${
                        isSelected
                          ? 'text-sky-600 dark:text-sky-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {item.title}
                    </h4>
                    {item.snippet && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {item.snippet}
                      </p>
                    )}
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1 text-[10px] text-sky-600 dark:text-sky-400 font-mono self-center shrink-0">
                      <span>Mở</span>
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
        </div>

        {/* Footer info */}
        {results.length > 0 && (
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-3">
              <span>↑↓: Di chuyển</span>
              <span>Enter: Mở bài</span>
              <span>ESC: Đóng</span>
            </div>
            <span>{results.length} kết quả</span>
          </div>
        )}
      </div>
    </div>
  );
}
