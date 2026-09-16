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
    <div className="flex-1 py-12 md:py-16 bg-white dark:bg-[#0a0f1e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Layers className="w-4 h-4" />
            <span>Lộ trình đào tạo toàn diện</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Khóa học Lập trình Python
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-3xl leading-relaxed">
            {course.total_parts} phần đưa bạn từ khái niệm cơ bản đến OOP, cấu trúc dữ liệu nâng cao, đệ quy và xây dựng ứng dụng.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
              <span className="font-bold text-slate-900 dark:text-white">{course.total_parts}</span> phần
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
              <span className="font-bold text-slate-900 dark:text-white">{course.total_lessons}</span> bài học
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
              <span className="font-bold text-slate-900 dark:text-white">{course.total_exercises}</span> bài tập
            </div>
          </div>
        </div>

        {/* Parts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
