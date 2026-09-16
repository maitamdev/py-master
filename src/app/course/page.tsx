import type { Metadata } from 'next';
import { Layers } from 'lucide-react';
import { getCourse, getParts, getAllExercises } from '@/lib/course';
import { PartCard } from '@/components/course/part-card';

export const metadata: Metadata = {
  title: 'Chương trình học Python 14 phần',
  description:
    'Lộ trình toàn diện khóa học Lập trình Python tiếng Việt gồm 14 phần, 78 bài học và 283 bài tập thực hành.',
};

export default async function CoursePage() {
  const [course, parts, exercises] = await Promise.all([
    getCourse(),
    getParts(),
    getAllExercises(),
  ]);

  // Count exercises per part
  const exerciseCountByPart: Record<number, number> = {};
  for (const ex of exercises) {
    exerciseCountByPart[ex.part] = (exerciseCountByPart[ex.part] || 0) + 1;
  }

  return (
    <div className="flex-1 py-10 md:py-14 bg-slate-50/50 dark:bg-[#090d16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="mb-10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <Layers className="w-4 h-4" />
            <span>Lộ trình đào tạo toàn diện 14 phần</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Khóa học Lập trình Python Toàn diện
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Giáo trình 14 phần đưa bạn từ những khái niệm lập trình cơ bản nhất đến các kỹ thuật hướng đối tượng (OOP), cấu trúc dữ liệu nâng cao, xử lý tệp, thuật toán đệ quy và xây dựng ứng dụng hoàn chỉnh.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white">{course.total_parts}</span> phần học
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white">{course.total_lessons}</span> bài học
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white">{course.total_exercises}</span> bài tập thực hành
            </div>
          </div>
        </div>

        {/* Parts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parts.map((part) => (
            <PartCard
              key={part.part}
              part={part}
              exercisesCount={exerciseCountByPart[part.part] || 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
