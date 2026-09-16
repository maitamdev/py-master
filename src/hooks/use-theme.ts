'use client';

import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_KEY = 'python-master:theme';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((mode: ThemeMode) => {
    const isDark =
      mode === 'dark' ||
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    setResolvedTheme(isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    setMounted(true);
    let saved: ThemeMode = 'system';
    try {
      saved = (window.localStorage.getItem(THEME_KEY) as ThemeMode) || 'system';
    } catch {
      saved = 'system';
    }
    setThemeState(saved);
    applyTheme(saved);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const current = (window.localStorage.getItem(THEME_KEY) as ThemeMode) || 'system';
      if (current === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme]);

  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      setThemeState(newTheme);
      try {
        window.localStorage.setItem(THEME_KEY, newTheme);
      } catch (e) {
        console.error('Error saving theme:', e);
      }
      applyTheme(newTheme);
    },
    [applyTheme]
  );

  return {
    theme,
    resolvedTheme,
    setTheme,
    mounted,
  };
}
