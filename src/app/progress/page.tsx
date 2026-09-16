'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Terminal,
  Award,
  Download,
  Upload,
} from 'lucide-react';
import { useProgress } from '@/hooks/use-progress';
import { useNotes } from '@/hooks/use-notes';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { ProgressBar } from '@/components/course/progress-bar';
import { CertificateModal } from '@/components/course/certificate-modal';
import { BadgesSection } from '@/components/course/badges-section';
import { downloadBackupFile, importBackupData } from '@/lib/storage/backup';

const PARTS_DATA = [
  { part: 1, title: 'Bắt đầu với Lập trình Python', lessonsCount: 6, exCount: 18 },
  { part: 2, title: 'Cấu trúc Điều kiện và Vòng lặp đơn giản', lessonsCount: 5, exCount: 17 },
  { part: 3, title: 'Vòng lặp có điều kiện, Chuỗi và Hàm', lessonsCount: 5, exCount: 22 },
  { part: 4, title: 'Hàm nâng cao, Danh sách (List) và Định dạng', lessonsCount: 7, exCount: 29 },
  { part: 5, title: 'Tham chiếu, Từ điển (Dictionary) và Tuple', lessonsCount: 5, exCount: 26 },
  { part: 6, title: 'Thao tác Tệp tin và Xử lý Ngoại lệ', lessonsCount: 5, exCount: 19 },
  { part: 7, title: 'Mô-đun và Các tính năng nâng cao của Python', lessonsCount: 7, exCount: 19 },
  { part: 8, title: 'Lập trình Hướng đối tượng: Lớp và Phương thức', lessonsCount: 6, exCount: 16 },
  { part: 9, title: 'Đối tượng, Thuộc tính và Đóng gói (Encapsulation)', lessonsCount: 7, exCount: 15 },
  { part: 10, title: 'Kế thừa Lớp và Kỹ thuật Hướng đối tượng', lessonsCount: 5, exCount: 12 },
  { part: 11, title: 'List Comprehensions và Đệ quy (Recursion)', lessonsCount: 5, exCount: 19 },
  { part: 12, title: 'Hàm như Đối số, Generator và Biểu thức chính quy', lessonsCount: 5, exCount: 15 },
  { part: 13, title: 'Lập trình Game đồ họa với Pygame', lessonsCount: 5, exCount: 17 },
  { part: 14, title: 'Dự án Phát triển Game hoàn chỉnh', lessonsCount: 5, exCount: 1 },
];

export default function ProgressPage() {
  const { progress, resetProgress, mounted } = useProgress();
  const { notes } = useNotes();
  const { bookmarks } = useBookmarks();
  const [certModalOpen, setCertModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalLessons = 78;
  const totalExercises = 283;

  const completedLessonsCount = mounted ? progress.completedLessons.length : 0;
  const completedExercisesCount = mounted ? progress.completedExercises.length : 0;

  const overallPercentage = Math.min(
    100,
    Math.round((completedLessonsCount / totalLessons) * 100)
  );

  const handleReset = () => {
    if (
      confirm(
        'Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ học tập? Mọi đánh dấu hoàn thành sẽ được xóa về ban đầu.'
      )
    ) {
      resetProgress();
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (typeof content === 'string') {
        const res = importBackupData(content);
        if (res.success) {
          alert(`Khôi phục thành công ${res.count} mục dữ liệu tiến độ! Trang sẽ tải lại để cập nhật.`);
          window.location.reload();
        } else {
          alert(res.error || 'Có lỗi khi nhập dữ liệu sao lưu.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex-1 py-10 md:py-14 bg-slate-50/50 dark:bg-[#090d16]">
      {/* Hidden file picker for backup restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".json"
        className="hidden"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              <BarChart3 className="w-4 h-4" />
              <span>Tiến độ học tập</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Bảng theo dõi quá trình học
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dữ liệu được lưu trữ tự động trên thiết bị của bạn. Bạn có thể sao lưu để chuyển sang máy khác.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Certificate Trigger Button */}
            <button
              onClick={() => setCertModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:scale-105"
            >
              <Award className="w-4 h-4" />
              <span>Nhận chứng chỉ</span>
            </button>

            {/* Export Backup */}
            <button
              onClick={downloadBackupFile}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
              title="Tải tệp JSON sao lưu toàn bộ tiến độ"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sao lưu</span>
            </button>

            {/* Import Backup */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
              title="Khôi phục tiến độ từ tệp JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Khôi phục</span>
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Đặt lại tiến độ về ban đầu"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Bài học hoàn thành</span>
              <BookOpen className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {completedLessonsCount}
              <span className="text-sm font-normal text-slate-400 ml-1">/ {totalLessons}</span>
            </div>
            <ProgressBar value={completedLessonsCount} max={totalLessons} size="sm" />
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Bài tập thực hành đạt</span>
              <Terminal className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {completedExercisesCount}
              <span className="text-sm font-normal text-slate-400 ml-1">/ {totalExercises}</span>
            </div>
            <ProgressBar value={completedExercisesCount} max={totalExercises} size="sm" />
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Tổng tiến độ khóa học</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-sky-600 dark:text-sky-400">
              {overallPercentage}%
            </div>
            <ProgressBar value={overallPercentage} max={100} size="sm" />
          </div>
        </div>

        {/* Badges and Achievements Section */}
        <BadgesSection
          completedLessonsCount={completedLessonsCount}
          completedExercisesCount={completedExercisesCount}
          notesCount={notes.length}
          bookmarksCount={bookmarks.length}
        />

        {/* Detailed Breakdown per Part */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Tiến trình chi tiết theo từng Phần
            </h2>
            <span className="text-xs text-slate-400">14 Phần học</span>
          </div>

          <div className="space-y-3">
            {PARTS_DATA.map((p) => {
              const partPrefix = `part${String(p.part).padStart(2, '0')}`;
              const lessonsDone = mounted
                ? progress.completedLessons.filter((id) => id.startsWith(partPrefix)).length
                : 0;
              const exDone = mounted
                ? progress.completedExercises.filter((id) => id.includes(partPrefix)).length
                : 0;

              const partLessonPct = Math.round((lessonsDone / p.lessonsCount) * 100);
              const isPartComplete = lessonsDone >= p.lessonsCount;

              return (
                <div
                  key={p.part}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                        Phần {p.part}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {p.title}
                      </h3>
                      {isPartComplete && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                    </div>

                    {/* Progress Bar & numbers */}
                    <div className="space-y-1 max-w-md">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>
                          Bài học: <strong>{lessonsDone}/{p.lessonsCount}</strong> • Bài tập: <strong>{exDone}/{p.exCount}</strong>
                        </span>
                        <span className="font-semibold text-sky-600 dark:text-sky-400">
                          {partLessonPct}%
                        </span>
                      </div>
                      <ProgressBar value={lessonsDone} max={p.lessonsCount} size="sm" />
                    </div>
                  </div>

                  <Link
                    href={`/course/part-${p.part}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/40 self-start md:self-center transition-colors"
                  >
                    <span>Vào học</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        completedCount={completedLessonsCount}
      />
    </div>
  );
}
