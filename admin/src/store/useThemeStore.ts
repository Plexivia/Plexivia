import { create } from 'zustand';

export type Theme = 'light' | 'dark';

export const RADIUS_OPTIONS = [
  { id: 'sharp', label: 'Sharp', value: '0.25rem' },
  { id: 'medium', label: 'Medium', value: '0.375rem' },
  { id: 'rounded', label: 'Rounded', value: '0.5rem' },
  { id: 'soft', label: 'Soft', value: '0.625rem' },
] as const;

export type RadiusId = (typeof RADIUS_OPTIONS)[number]['id'];

const DEFAULT_RADIUS: RadiusId = 'rounded';

// Apply a saved radius to the document root and return the active preset ID
const getInitialRadius = (): RadiusId => {
  if (typeof window === 'undefined') return DEFAULT_RADIUS;
  let saved: string | null = null;
  try {
    saved = localStorage.getItem('plexivia_radius');
  } catch {
    saved = null;
  }
  const option = RADIUS_OPTIONS.find((o) => o.id === saved) || RADIUS_OPTIONS.find((o) => o.id === DEFAULT_RADIUS)!;
  document.documentElement.style.setProperty('--radius', option.value);
  return option.id;
};

// Resolve initial light or dark theme from localStorage and apply class to document
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
    document.documentElement.classList.remove('dark');
  }
  return 'light';
};

interface ThemeStore {
  theme: Theme;
  isDark: boolean;
  radius: RadiusId;
  setRadius: (radius: RadiusId) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: getInitialTheme(),
  isDark: getInitialTheme() === 'dark',
  radius: getInitialRadius(),

  // Persist and apply a new corner radius preset
  setRadius: (radius: RadiusId) => {
    const option = RADIUS_OPTIONS.find((o) => o.id === radius);
    if (!option) return;
    document.documentElement.style.setProperty('--radius', option.value);
    try {
      localStorage.setItem('plexivia_radius', radius);
    } catch {
      void 0;
    }
    set({ radius });
  },

  // Persist and apply light or dark theme
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

  // Toggle between light and dark theme
  toggleTheme: () => {
    const nextTheme: Theme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },
}));

export const useTheme = useThemeStore;
export default useThemeStore;
