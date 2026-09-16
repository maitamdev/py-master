'use client';

import { Award, CheckCircle2, Lock, Sparkles, Flame, Star, BookOpen, Code, FileText, Bookmark } from 'lucide-react';

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: typeof Award;
  unlocked: boolean;
  progressText: string;
}

export function BadgesSection({
  completedLessonsCount,
  completedExercisesCount,
  notesCount = 0,
  bookmarksCount = 0,
}: {
  completedLessonsCount: number;
  completedExercisesCount: number;
  notesCount?: number;
  bookmarksCount?: number;
}) {
  const badges: BadgeItem[] = [
    {
      id: 'first-step',
      name: 'Khởi đầu vững chắc',
      description: 'Hoàn thành bài học lý thuyết đầu tiên',
      icon: BookOpen,
      unlocked: completedLessonsCount >= 1,
      progressText: `${Math.min(completedLessonsCount, 1)}/1 bài`,
    },
    {
      id: 'first-code',
      name: 'Thực thi mã nguồn',
      description: 'Hoàn thành bài tập lập trình đầu tiên',
      icon: Code,
      unlocked: completedExercisesCount >= 1,
      progressText: `${Math.min(completedExercisesCount, 1)}/1 bài`,
    },
    {
      id: 'momentum',
      name: 'Đà bứt phá',
      description: 'Hoàn thành ít nhất 5 bài học',
      icon: Flame,
      unlocked: completedLessonsCount >= 5,
      progressText: `${Math.min(completedLessonsCount, 5)}/5 bài`,
    },
    {
      id: 'exercise-5',
      name: 'Thợ săn giải thuật',
      description: 'Vượt qua 5 bài tập thực hành',
      icon: Star,
      unlocked: completedExercisesCount >= 5,
      progressText: `${Math.min(completedExercisesCount, 5)}/5 bài`,
    },
    {
      id: 'notetaker',
      name: 'Nhà ghi chú thông thái',
      description: 'Lưu lại ít nhất 1 ghi chú bài học',
      icon: FileText,
      unlocked: notesCount >= 1,
      progressText: `${Math.min(notesCount, 1)}/1 ghi chú`,
    },
    {
      id: 'bookmarker',
      name: 'Thư viện tri thức',
      description: 'Đánh dấu lưu trữ bài học yêu thích',
      icon: Bookmark,
      unlocked: bookmarksCount >= 1,
      progressText: `${Math.min(bookmarksCount, 1)}/1 lưu trữ`,
    },
    {
      id: 'exercise-25',
      name: 'Chiến binh Python',
      description: 'Vượt qua 25 bài tập lập trình',
      icon: Award,
      unlocked: completedExercisesCount >= 25,
      progressText: `${Math.min(completedExercisesCount, 25)}/25 bài`,
    },
    {
      id: 'halfway',
      name: 'Nửa chặng đường',
      description: 'Hoàn thành 39/78 bài học khóa học',
      icon: Sparkles,
      unlocked: completedLessonsCount >= 39,
      progressText: `${Math.min(completedLessonsCount, 39)}/39 bài`,
    },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
            <Sparkles className="w-4 h-4" />
            <span>Huy hiệu thành tích</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Bộ sưu tập danh hiệu học tập ({unlockedCount}/{badges.length})
          </h2>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
          {Math.round((unlockedCount / badges.length) * 100)}% mở khóa
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                badge.unlocked
                  ? 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30 dark:border-amber-500/20'
                  : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      badge.unlocked
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {badge.unlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {badge.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {badge.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-medium text-slate-400">
                <span>Tiến trình:</span>
                <span className={badge.unlocked ? 'text-amber-500 font-bold' : ''}>
                  {badge.progressText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
