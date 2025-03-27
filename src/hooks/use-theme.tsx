
import { useEffect, useState } from 'react';
import { useLocalStorage } from './use-local-storage';

type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Détecter le thème du système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    updateSystemTheme(mediaQuery);
    mediaQuery.addEventListener('change', updateSystemTheme);

    return () => mediaQuery.removeEventListener('change', updateSystemTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Appliquer le thème
    const applyTheme = theme === 'system' ? systemTheme : theme;
    
    if (applyTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, systemTheme]);

  return { theme, setTheme, currentTheme: theme === 'system' ? systemTheme : theme };
};
