import Link from 'next/link';
import {
  Terminal,
  CheckCircle2,
  ArrowRight,
  Bot,
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
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-[#090d16] dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/80 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span>Nền tảng Lập trình Python Toàn diện • Phát triển bởi MaiTamDev</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Học Python từ nền tảng
              <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600">
                đến tư duy lập trình thực sự
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Khóa học tiếng Việt toàn diện từ cơ bản đến nâng cao. Chạy code Python trực tiếp trên trình duyệt, thực hành 283 bài tập thực tế và đồng hành cùng Giáo viên AI thông minh.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link
                href="/course"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 transition-all hover:gap-3"
              >
                <span>Bắt đầu học ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#curriculum"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
              >
                <span>Xem 14 phần lộ trình</span>
              </Link>
              <Link
                href="/playground"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
              >
                <Terminal className="w-4 h-4" />
                <span>Thử Playground</span>
              </Link>
            </div>

            {/* Real Stats counter */}
            <div className="pt-10 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto border-t border-slate-200/80 dark:border-slate-800/80">
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {course.total_parts}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Phần học bài bản
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {course.total_lessons}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Bài học chi tiết
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {course.total_exercises}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Bài tập lập trình
                </div>
              </div>
            </div>
          </div>

          {/* Resume Learning Card (Dynamic based on localStorage) */}
          <ResumeLearningCard lessonsMap={lessonsMap} />
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-16 bg-white dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Học lập trình theo cách hiệu quả nhất
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Kết hợp giữa giáo trình đại học chuẩn quốc tế, thực hành mã trực tiếp và hỗ trợ cá nhân hóa từ AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Chạy Python Trực Tiếp (WASM)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Không cần cài đặt phức tạp. Hệ thống chạy Python 3.12+ ngay trên trình duyệt bằng WebAssembly (Pyodide), đảm bảo tốc độ và bảo mật tuyệt đối.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Gia Sư AI Không Đưa Đáp Án Sẵn
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Được huấn luyện theo phương pháp sư phạm Socratic: gợi ý từng bước, phân tích lỗi sai và giúp bạn tự mình viết nên dòng code đúng.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                283 Bài Tập Từ Thực Tế
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Từ các câu lệnh in ấn đầu tiên, vòng lặp, hàm, danh sách đến lập trình hướng đối tượng (OOP), đệ quy và dự án hoàn chỉnh.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Overview Section */}
      <section id="curriculum" className="py-20 bg-slate-50/60 dark:bg-[#090d16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1">
                Lộ trình 14 phần
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Toàn bộ nội dung khóa học
              </h2>
            </div>
            <Link
              href="/course"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
            >
              <span>Xem trang tổng quan khóa học</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Grid of Parts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parts.map((part) => (
              <PartCard key={part.part} part={part} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Sẵn sàng làm chủ ngôn ngữ lập trình Python?
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            Học hoàn toàn miễn phí theo bản quyền mở Creative Commons (CC BY-NC-SA 4.0). Lưu lại tiến độ và ghi chú ngay trên trình duyệt của bạn.
          </p>
          <div className="pt-2">
            <Link
              href="/lesson/part01-1-getting-started"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-xl shadow-sky-600/30 transition-all hover:scale-105"
            >
              <span>Bắt đầu bài học đầu tiên ngay</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
