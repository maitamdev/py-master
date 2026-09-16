'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Note } from '@/types';
import { notesRepo } from '@/lib/storage';

export function useNotes(lessonId?: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [mounted, setMounted] = useState(false);

  const refreshNotes = useCallback(() => {
    if (lessonId) {
      setNotes(notesRepo.getNotesByLesson(lessonId));
    } else {
      setNotes(notesRepo.getNotes());
    }
  }, [lessonId]);

  useEffect(() => {
    setMounted(true);
    refreshNotes();

    const handleNotesChange = () => {
      refreshNotes();
    };

    window.addEventListener('python-master:notes-changed', handleNotesChange);
    return () => {
      window.removeEventListener('python-master:notes-changed', handleNotesChange);
    };
  }, [refreshNotes]);

  const saveNote = useCallback(
    (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
      const saved = notesRepo.saveNote(noteData);
      refreshNotes();
      return saved;
    },
    [refreshNotes]
  );

  const deleteNote = useCallback(
    (id: string) => {
      notesRepo.deleteNote(id);
      refreshNotes();
    },
    [refreshNotes]
  );

  return {
    notes,
    mounted,
    saveNote,
    deleteNote,
    refreshNotes,
  };
}
