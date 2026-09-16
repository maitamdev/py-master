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
    <div className="flex-1 flex flex-col bg-white dark:bg-[#0a0f1e]">
      {/* Client tracker */}
      <LessonTracker lessonId={lesson.id} partNum={lesson.part} />

      {/* Breadcrumbs */}
      <div className="sticky top-16 z-30 w-full border-b border-slate-200/60 dark:border-white/[0.06] bg-white/90 dark:bg-[#0a0f1e]/90 backdrop-blur-xl px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 truncate">
          <Link href="/course" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Khóa học
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link
            href={`/course/part-${lesson.part}`}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
          >
            Phần {lesson.part}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
            {lesson.title_vi || lesson.title_original}
          </span>
        </div>

        <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded">
          {lesson.blocks_count} phần
        </span>
      </div>

      {/* Main Content */}
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
