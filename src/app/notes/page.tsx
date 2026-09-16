'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Trash2, Edit3, ArrowRight, BookOpen, Save } from 'lucide-react';
import { useNotes } from '@/hooks/use-notes';

export default function NotesPage() {
  const { notes, deleteNote, saveNote, mounted } = useNotes();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');

  const handleStartEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const handleSaveEdit = (note: (typeof notes)[0]) => {
    if (!editContent.trim()) return;
    saveNote({
      id: note.id,
      lessonId: note.lessonId,
      lessonTitle: note.lessonTitle,
      part: note.part,
      content: editContent,
    });
    setEditingId(null);
  };

  return (
    <div className="flex-1 py-10 md:py-14 bg-slate-50/50 dark:bg-[#090d16]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <FileText className="w-4 h-4" />
            <span>Sổ tay học tập</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Ghi chú cá nhân của bạn
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tổng hợp toàn bộ các ghi chú, mẹo lập trình và suy ngẫm bạn đã ghi lại trong quá trình học.
          </p>
        </div>

        {!mounted ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Đang tải sổ tay ghi chú...
          </div>
        ) : notes.length === 0 ? (
          /* Empty state */
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-500 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Bạn chưa tạo ghi chú nào
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Khi học từng bài, bạn có thể ghi chú lại các kiến thức trọng tâm ở thanh công cụ bên phải để ghi nhớ lâu hơn.
              </p>
            </div>
            <Link
              href="/course"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-colors"
            >
              <span>Vào học và ghi chú</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => {
              const isEditing = editingId === note.id;

              return (
                <div
                  key={note.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <Link
                      href={`/lesson/${note.lessonId}`}
                      className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{note.lessonTitle || `Bài học (${note.lessonId})`}</span>
                    </Link>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        {new Date(note.updatedAt).toLocaleDateString('vi-VN')}
                      </span>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Xóa ghi chú"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={4}
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleSaveEdit(note)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-bold bg-sky-600 text-white rounded-lg"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </div>
                  )}

                  {!isEditing && (
                    <div className="pt-2 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleStartEdit(note.id, note.content)}
                        className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-sky-600 dark:hover:text-sky-400"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Chỉnh sửa</span>
                      </button>
                      <Link
                        href={`/lesson/${note.lessonId}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                      >
                        <span>Mở bài học này</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
