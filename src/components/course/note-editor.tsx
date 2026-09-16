'use client';

import { useState } from 'react';
import { FileText, Save, Trash2, Plus } from 'lucide-react';
import { useNotes } from '@/hooks/use-notes';

export function NoteEditor({
  lessonId,
  lessonTitle,
  part,
  blockId,
}: {
  lessonId: string;
  lessonTitle: string;
  part: number;
  blockId?: string;
}) {
  const { notes, saveNote, deleteNote, mounted } = useNotes(lessonId);
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  if (!mounted) return null;

  const handleSave = () => {
    if (!content.trim()) return;
    saveNote({
      id: editingId || undefined,
      lessonId,
      lessonTitle,
      part,
      blockId,
      content,
    });
    setContent('');
    setEditingId(null);
    setIsAdding(false);
  };

  const handleEdit = (note: { id: string; content: string }) => {
    setEditingId(note.id);
    setContent(note.content);
    setIsAdding(true);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          <FileText className="w-4 h-4 text-sky-500" />
          <span>Ghi chú của bạn ({notes.length})</span>
        </div>
        {!isAdding && (
          <button
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setContent('');
            }}
            className="flex items-center gap-1 text-xs font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 p-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm
          </button>
        )}
      </div>

      {/* Adding/Editing box */}
      {isAdding && (
        <div className="mt-3 space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết ghi chú ngắn cho bài này (ví dụ: while khác for ở chỗ...)"
            rows={3}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-sky-500 transition-colors resize-none"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
                setContent('');
              }}
              className="px-2.5 py-1 rounded text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white"
            >
              <Save className="w-3.5 h-3.5" />
              Lưu
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
        {notes.length === 0 && !isAdding && (
          <p className="text-xs text-slate-400 text-center py-2">
            Chưa có ghi chú nào cho bài học này.
          </p>
        )}
        {notes.map((n) => (
          <div
            key={n.id}
            className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 group"
          >
            <p className="whitespace-pre-wrap leading-relaxed">{n.content}</p>
            <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/50 dark:border-slate-700/50 text-[10px] text-slate-400">
              <span>{new Date(n.updatedAt).toLocaleDateString('vi-VN')}</span>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(n)}
                  className="text-sky-600 dark:text-sky-400 hover:underline"
                >
                  Sửa
                </button>
                <button
                  onClick={() => deleteNote(n.id)}
                  className="text-rose-500 hover:text-rose-600"
                  title="Xóa ghi chú"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
