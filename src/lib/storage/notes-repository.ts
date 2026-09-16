import type { Note } from '@/types';

const STORAGE_KEY = 'python-master:notes';

export class LocalNotesRepository {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  getNotes(): Note[] {
    if (!this.isBrowser()) return [];
    try {
      const data = window.localStorage.getItem(STORAGE_KEY);
      return data ? (JSON.parse(data) as Note[]) : [];
    } catch {
      return [];
    }
  }

  private saveNotes(notes: Note[]): void {
    if (!this.isBrowser()) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      window.dispatchEvent(new CustomEvent('python-master:notes-changed', { detail: notes }));
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  }

  getNotesByLesson(lessonId: string): Note[] {
    return this.getNotes().filter((n) => n.lessonId === lessonId);
  }

  saveNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Note {
    const notes = this.getNotes();
    const now = new Date().toISOString();

    if (note.id) {
      const idx = notes.findIndex((n) => n.id === note.id);
      if (idx !== -1) {
        const updated: Note = {
          ...notes[idx],
          content: note.content,
          updatedAt: now,
        };
        notes[idx] = updated;
        this.saveNotes(notes);
        return updated;
      }
    }

    const newNote: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lessonId: note.lessonId,
      lessonTitle: note.lessonTitle,
      part: note.part,
      content: note.content,
      blockId: note.blockId,
      createdAt: now,
      updatedAt: now,
    };
    notes.unshift(newNote);
    this.saveNotes(notes);
    return newNote;
  }

  deleteNote(id: string): void {
    const notes = this.getNotes().filter((n) => n.id !== id);
    this.saveNotes(notes);
  }
}

export const notesRepo = new LocalNotesRepository();
