import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { getPart, getParts, getExercisesByPart } from '@/lib/course';
import { LessonItem } from '@/components/course/lesson-item';

export async function generateStaticParams() {
  const parts = await getParts();
  return parts.map((p) => ({
    part: `part-${p.part}`,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ part: string }>;
}): Promise<Metadata> {
  const { part: partSlug } = await params;
  const part = await getPart(partSlug);
  if (!part) return { title: 'Không tìm thấy phần học' };

  return {
    title: `Phần ${part.part}: ${part.title_vi || part.title_original}`,
    description: `Chi tiết các bài học và bài tập của Phần ${part.part} trong khóa học Lập trình Python tiếng Việt.`,
  };
}

export default async function PartDetailPage({
  params,
}: {
  params: Promise<{ part: string }>;
}) {
  const { part: partSlug } = await params;
  const part = await getPart(partSlug);

  if (!part) {
    notFound();
  }

  const exercises = await getExercisesByPart(part.part);
  const lessons = part.lessons.filter((l) => !l.is_index);

  // Group exercises by lesson_id
  const exCountByLesson: Record<string, number> = {};
  for (const ex of exercises) {
    exCountByLesson[ex.lesson_id] = (exCountByLesson[ex.lesson_id] || 0) + 1;
  }

  const firstLesson = lessons[0];

  return (
    <div className="flex-1 py-10 md:py-14 bg-slate-50/50 dark:bg-[#090d16]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/course"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh sách các phần học</span>
          </Link>
        </div>

        {/* Part Header Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60">
              PHẦN {part.part}
            </span>
            <span className="text-xs text-slate-500">• {lessons.length} bài học • {exercises.length} bài tập</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {part.title_vi || part.title_original}
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Danh sách toàn bộ các bài học lý thuyết và bài tập thực hành của Phần {part.part}. Bạn có thể học theo thứ tự hoặc chọn bất kỳ bài học nào bên dưới.
          </p>

          {firstLesson && (
            <div className="pt-2">
              <Link
                href={`/lesson/${firstLesson.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/30 transition-all hover:gap-3"
              >
                <span>Bắt đầu học Phần {part.part}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Danh sách bài học ({lessons.length})</span>
            <span className="text-xs text-slate-400 font-normal">Được đánh dấu tiến độ tự động</span>
          </h2>

          <div className="space-y-3">
            {lessons.map((lesson) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                partNum={part.part}
                exerciseCount={exCountByLesson[lesson.id] || 0}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
