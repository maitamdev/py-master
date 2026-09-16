import Link from 'next/link';
import {
  Terminal,
  CheckCircle2,
  ArrowRight,
  Bot,
  Sparkles,
} from 'lucide-react';
import { getCourse, getParts, getAllLessons } from '@/lib/course';
import { PartCard } from '@/components/course/part-card';
import { ResumeLearningCard } from '@/components/course/resume-learning-card';

export default async function HomePage() {
  const course = await getCourse();
  const parts = await getParts();
  const lessons = await getAllLessons();

  const lessonsMap: Record<string, { title: string; part: number; slug: string }> = {};
  for (const l of lessons) {
    lessonsMap[l.id] = {
      title: l.title_vi || l.title_original,
      part: l.part,
      slug: l.slug,
    };
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-blue-950/20 dark:via-[#0a0f1e] dark:to-[#0a0f1e]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.06),transparent)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-500/[0.08] text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/[0.15]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nền tảng Lập trình Python Toàn diện • MaiTamDev</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Học Python từ nền tảng
              <span className="block mt-2 gradient-text">
                đến tư duy lập trình thực sự
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Khóa học tiếng Việt toàn diện từ cơ bản đến nâng cao. Chạy code Python trực tiếp trên trình duyệt, thực hành {course.total_exercises} bài tập thực tế và đồng hành cùng Gia sư AI.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/course"
                className="w-full sm:w-auto btn-primary inline-flex items-center justify-center gap-2 px-7 py-3 text-sm"
              >
                <span>Bắt đầu học ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#curriculum"
                className="w-full sm:w-auto btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 text-sm"
              >
                <span>Xem lộ trình 14 phần</span>
              </Link>
              <Link
                href="/playground"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Terminal className="w-4 h-4" />
                <span>Thử Playground</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="pt-12 flex items-center justify-center gap-8 sm:gap-12">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {course.total_parts}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
                  Phần học
                </div>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-white/[0.06]" />
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {course.total_lessons}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
                  Bài học
                </div>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-white/[0.06]" />
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {course.total_exercises}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
                  Bài tập
                </div>
              </div>
            </div>
          </div>

          {/* Resume Learning Card */}
          <ResumeLearningCard lessonsMap={lessonsMap} />
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 border-y border-slate-200/60 dark:border-white/[0.06] bg-slate-50/50 dark:bg-[#0f1629]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Học lập trình theo cách hiệu quả nhất
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Kết hợp giáo trình chuẩn quốc tế, thực hành mã trực tiếp và hỗ trợ cá nhân hóa từ AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="animate-fade-in p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-4 hover:border-blue-300 dark:hover:border-blue-500/20 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
                Python Trực Tiếp (WASM)
              </h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Không cần cài đặt. Hệ thống chạy Python 3.12+ ngay trên trình duyệt bằng WebAssembly (Pyodide).
              </p>
            </div>

            {/* Feature 2 */}
            <div className="animate-fade-in delay-100 p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-4 hover:border-indigo-300 dark:hover:border-indigo-500/20 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
                Gia Sư AI Thông Minh
              </h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Phương pháp Socratic: gợi ý từng bước, phân tích lỗi sai, giúp bạn tự viết code đúng.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="animate-fade-in delay-200 p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-4 hover:border-emerald-300 dark:hover:border-emerald-500/20 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
                {course.total_exercises} Bài Tập Thực Tế
              </h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Từ lệnh print đầu tiên đến OOP, đệ quy và dự án hoàn chỉnh. Chấm điểm tự động.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Overview */}
      <section id="curriculum" className="py-20 bg-white dark:bg-[#0a0f1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Lộ trình 14 phần
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Toàn bộ nội dung khóa học
              </h2>
            </div>
            <Link
              href="/course"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <span>Xem trang tổng quan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {parts.map((part) => (
              <PartCard key={part.part} part={part} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-slate-200/60 dark:border-white/[0.06] bg-slate-50/50 dark:bg-[#0f1629]/30">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sẵn sàng làm chủ Python?
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Học hoàn toàn miễn phí theo bản quyền mở CC BY-NC-SA 4.0. Lưu tiến độ và ghi chú ngay trên trình duyệt.
          </p>
          <div className="pt-2">
            <Link
              href="/lesson/part01-1-getting-started"
              className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-sm"
            >
              <span>Bắt đầu bài học đầu tiên</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
