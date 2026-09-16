'use client';

import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Code2,
  Search,
  BookOpen,
  Terminal,
  BarChart3,
  Bookmark,
  FileText,
  Sun,
  Moon,
  Laptop,
  Menu,
  X,
  Bot,
} from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useProgress } from '@/hooks/use-progress';
import { SearchDialog } from '@/components/ui/search-dialog';

export function Header() {
  const pathname = usePathname();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { progress } = useProgress();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Keyboard shortcut Ctrl/Cmd + K or Ctrl/Cmd + P
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'k' || e.key.toLowerCase() === 'p')) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { href: '/course', label: 'Khóa học', icon: BookOpen },
    { href: '/playground', label: 'Playground', icon: Terminal },
    { href: '/progress', label: 'Tiến độ', icon: BarChart3 },
    { href: '/bookmarks', label: 'Đã lưu', icon: Bookmark },
    { href: '/notes', label: 'Ghi chú', icon: FileText },
  ];

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const completedCount = progress.completedLessons.length;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-[#0a0f1e]/80 backdrop-blur-xl transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <NextLink href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all group-hover:scale-105">
                <Code2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-bold tracking-tight text-slate-900 dark:text-white text-[15px]">
                PYTHON-MASTER
              </span>
            </NextLink>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <NextLink
                    key={item.href}
                    href={item.href}
                    className={`relative px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-blue-500 rounded-full" />
                    )}
                  </NextLink>
                );
              })}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200/70 dark:hover:bg-white/[0.07] rounded-lg border border-slate-200/80 dark:border-white/[0.06] transition-all"
              aria-label="Tìm kiếm khóa học"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-slate-400">Tìm kiếm...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-white/[0.06] rounded border border-slate-200 dark:border-white/[0.08] text-slate-400 dark:text-slate-500">
                ⌘K
              </kbd>
            </button>

            {/* AI Tutor shortcut */}
            <NextLink
              href="/ai-tutor"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/[0.08] border border-indigo-200/60 dark:border-indigo-500/[0.15] hover:bg-indigo-100 dark:hover:bg-indigo-500/[0.12] transition-all"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Gia sư AI</span>
            </NextLink>

            {/* Completed lessons badge */}
            {completedCount > 0 && (
              <NextLink
                href="/progress"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/[0.08] border border-emerald-200/60 dark:border-emerald-500/[0.15] rounded-full transition-all"
                title={`${completedCount} bài đã hoàn thành`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{completedCount}/78</span>
              </NextLink>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all"
              title={`Chế độ: ${theme} (bấm để đổi)`}
              aria-label="Chuyển đổi giao diện sáng tối"
            >
              {theme === 'system' ? (
                <Laptop className="w-4 h-4" />
              ) : resolvedTheme === 'dark' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/60 dark:border-white/[0.06] bg-white dark:bg-[#0f1629] px-4 py-3 space-y-1 animate-fade-in">
            {navLinks.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/[0.08]'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NextLink>
              );
            })}
            <NextLink
              href="/ai-tutor"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/[0.08]"
            >
              <Bot className="w-4 h-4" />
              Gia sư AI
            </NextLink>
          </div>
        )}
      </header>

      {/* Search modal */}
      <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
