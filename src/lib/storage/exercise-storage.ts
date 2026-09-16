export function getSavedExerciseCode(exerciseId: string, starterCode?: string | null): string {
  if (typeof window === 'undefined') return starterCode || '';
  try {
    const key = `python-master:exercise:${exerciseId}:code`;
    const saved = window.localStorage.getItem(key);
    if (saved !== null) return saved;
  } catch (e) {
    console.error('Error reading exercise code:', e);
  }
  return starterCode || '';
}

export function saveExerciseCode(exerciseId: string, code: string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `python-master:exercise:${exerciseId}:code`;
    window.localStorage.setItem(key, code);
  } catch (e) {
    console.error('Error saving exercise code:', e);
  }
}

export function resetExerciseCode(exerciseId: string, starterCode?: string | null): string {
  if (typeof window === 'undefined') return starterCode || '';
  try {
    const key = `python-master:exercise:${exerciseId}:code`;
    window.localStorage.removeItem(key);
  } catch (e) {
    console.error('Error resetting exercise code:', e);
  }
  return starterCode || '';
}
