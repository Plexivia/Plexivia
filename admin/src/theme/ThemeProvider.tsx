import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { ThemeConfig, ThemeContextValue, ThemeMode, ThemePreset } from './types';
import { DEFAULT_THEME, THEME_PRESETS } from './tokens';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeConfig;
  defaultPreset?: string;
  storageKey?: string;
  enableSystem?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme,
  defaultPreset = 'plexivia',
  storageKey = 'plexivia-theme',
  enableSystem = true,
}: ThemeProviderProps) {
  const initialPreset = useMemo(() => {
    return THEME_PRESETS.find((p) => p.id === defaultPreset)?.config || DEFAULT_THEME;
  }, [defaultPreset]);

  const [theme, setTheme] = useState<ThemeConfig>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return defaultTheme || initialPreset;
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen to system theme changes
  useEffect(() => {
    if (!enableSystem || typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [enableSystem]);

  const mode = theme.mode || 'light';
  const isDark = mode === 'dark' || (mode === 'system' && systemIsDark);

  // Apply CSS variables to :root
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // Toggle dark class
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const colors = theme.colors || {};
    const docTheme = theme.documentTheme || {};

    // Core Colors
    if (colors.primary) root.style.setProperty('--primary', colors.primary);
    if (colors.primaryForeground) root.style.setProperty('--primary-foreground', colors.primaryForeground);
    if (colors.secondary) root.style.setProperty('--secondary', colors.secondary);
    if (colors.secondaryForeground) root.style.setProperty('--secondary-foreground', colors.secondaryForeground);
    if (colors.accent) root.style.setProperty('--accent', colors.accent);
    if (colors.accentForeground) root.style.setProperty('--accent-foreground', colors.accentForeground);
    if (colors.background) root.style.setProperty('--background', colors.background);
    if (colors.foreground) root.style.setProperty('--foreground', colors.foreground);
    if (colors.card) root.style.setProperty('--card', colors.card);
    if (colors.cardForeground) root.style.setProperty('--card-foreground', colors.cardForeground);
    if (colors.sidebar) root.style.setProperty('--sidebar', colors.sidebar);
    if (colors.sidebarForeground) root.style.setProperty('--sidebar-foreground', colors.sidebarForeground);
    if (colors.sidebarBorder) root.style.setProperty('--sidebar-border', colors.sidebarBorder);
    if (colors.sidebarActive) root.style.setProperty('--sidebar-active', colors.sidebarActive);
    if (colors.border) root.style.setProperty('--border', colors.border);
    if (colors.muted) root.style.setProperty('--muted', colors.muted);
    if (colors.mutedForeground) root.style.setProperty('--muted-foreground', colors.mutedForeground);
    if (colors.ring) root.style.setProperty('--ring', colors.ring);

    // Radii & Fonts
    if (theme.borderRadius) root.style.setProperty('--radius', theme.borderRadius);
    if (theme.fontFamily) root.style.setProperty('--font-sans', theme.fontFamily);

    // Document Studio Tokens
    if (docTheme.headerBg) root.style.setProperty('--doc-header-bg', docTheme.headerBg);
    if (docTheme.headerText) root.style.setProperty('--doc-header-text', docTheme.headerText);
    if (docTheme.accentBorder) root.style.setProperty('--doc-border', docTheme.accentBorder);
    if (docTheme.stampColor) root.style.setProperty('--doc-stamp', docTheme.stampColor);
    if (docTheme.watermarkOpacity !== undefined) {
      root.style.setProperty('--doc-watermark-opacity', String(docTheme.watermarkOpacity));
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(theme));
    } catch {
      // ignore
    }
  }, [theme, isDark, storageKey]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setTheme((prev) => ({ ...prev, mode: newMode }));
  }, []);

  const updateTheme = useCallback((partialTheme: Partial<ThemeConfig>) => {
    setTheme((prev) => ({
      ...prev,
      ...partialTheme,
      colors: { ...prev.colors, ...partialTheme.colors },
      documentTheme: { ...prev.documentTheme, ...partialTheme.documentTheme },
    }));
  }, []);

  const applyPreset = useCallback((presetId: string) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setTheme(preset.config);
    }
  }, []);

  const value: ThemeContextValue = useMemo(
    () => ({
      theme,
      mode,
      isDark,
      setMode,
      updateTheme,
      applyPreset,
      presets: THEME_PRESETS,
    }),
    [theme, mode, isDark, setMode, updateTheme, applyPreset]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
