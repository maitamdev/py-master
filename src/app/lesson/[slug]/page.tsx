import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getAllLessons, getLessonWithNavigation, getParts } from '@/lib/course';
import { LessonTracker } from '@/components/course/lesson-tracker';
import { LessonViewContainer } from '@/components/course/lesson-view-container';

export async function generateStaticParams() {
  const lessons = await getAllLessons();
  return lessons.map((l) => ({
    slug: l.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const navData = await getLessonWithNavigation(slug);
  if (!navData) return { title: 'Không tìm thấy bài học' };

  const lesson = navData.lesson;
  return {
    title: `${lesson.title_vi || lesson.title_original} | Phần ${lesson.part}`,
    description: `Bài học "${lesson.title_vi}" thuộc Phần ${lesson.part} trong khóa học Lập trình Python tiếng Việt.`,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [navData, parts] = await Promise.all([
    getLessonWithNavigation(slug),
    getParts(),
  ]);

  if (!navData) {
    notFound();
  }

  const { lesson, prevLesson, nextLesson } = navData;
  const currentPart = parts.find((p) => p.part === lesson.part);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#090d16]">
      {/* Client tracker to store currentLesson */}
      <LessonTracker lessonId={lesson.id} partNum={lesson.part} />

      {/* Sub-header Breadcrumbs Bar */}
      <div className="sticky top-16 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 truncate">
          <Link href="/course" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
            Khóa học
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <Link
            href={`/course/part-${lesson.part}`}
            className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors truncate"
          >
            Phần {lesson.part}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span className="font-semibold text-slate-900 dark:text-white truncate">
            {lesson.title_vi || lesson.title_original}
          </span>
        </div>

        <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
          {lesson.blocks_count} phần nội dung
        </span>
      </div>

      {/* Responsive Zen-capable 3-Column Layout */}
      <LessonViewContainer
        lesson={lesson}
        parts={parts}
        prevLesson={prevLesson}
        nextLesson={nextLesson}
        currentPartTitle={currentPart?.title_vi}
      />
    </div>
  );
}

