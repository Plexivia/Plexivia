import { create } from 'zustand';

export type Theme = 'light' | 'dark';

// Corner roundness presets; the value feeds --radius, which every rounded-* class derives from
export const RADIUS_OPTIONS = [
  { id: 'sharp', label: 'Sharp', value: '0.25rem' },
  { id: 'medium', label: 'Medium', value: '0.5rem' },
  { id: 'rounded', label: 'Rounded', value: '0.75rem' },
  { id: 'soft', label: 'Soft', value: '1rem' },
] as const;

export type RadiusId = (typeof RADIUS_OPTIONS)[number]['id'];

const DEFAULT_RADIUS: RadiusId = 'rounded';

// Apply a saved radius to the document and return it
const getInitialRadius = (): RadiusId => {
  if (typeof window === 'undefined') return DEFAULT_RADIUS;
  let saved: string | null = null;
  try {
    saved = localStorage.getItem('plexivia_radius');
  } catch {
    // Storage blocked: keep the default
  }
  const option = RADIUS_OPTIONS.find((o) => o.id === saved) || RADIUS_OPTIONS.find((o) => o.id === DEFAULT_RADIUS)!;
  document.documentElement.style.setProperty('--radius', option.value);
  return option.id;
};

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
    // No saved choice: default to light regardless of the OS colour scheme
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

  setRadius: (radius: RadiusId) => {
    const option = RADIUS_OPTIONS.find((o) => o.id === radius);
    if (!option) return;
    document.documentElement.style.setProperty('--radius', option.value);
    try {
      localStorage.setItem('plexivia_radius', radius);
    } catch {
      // Not persisted, still applied for this session
    }
    set({ radius });
  },

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
