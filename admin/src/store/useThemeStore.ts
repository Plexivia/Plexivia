import { create } from 'zustand';

export type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('plexivia_theme') as Theme | null;
    if (saved === 'dark' || saved === 'light') {
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return saved;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
      return 'dark';
    }
  }
  return 'light';
};

interface ThemeStore {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: getInitialTheme(),
  isDark: getInitialTheme() === 'dark',

  setTheme: (theme: Theme) => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('plexivia_theme', theme);
    }
    set({ theme, isDark: theme === 'dark' });
  },

  toggleTheme: () => {
    const nextTheme: Theme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },
}));

export const useTheme = useThemeStore;
export default useThemeStore;
