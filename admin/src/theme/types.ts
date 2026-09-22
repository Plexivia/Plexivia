export type ThemeMode = 'light' | 'dark' | 'system';

export interface ColorTokens {
  primary: string;
  primaryForeground?: string;
  secondary?: string;
  secondaryForeground?: string;
  accent?: string;
  accentForeground?: string;
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
  sidebar?: string;
  sidebarForeground?: string;
  sidebarBorder?: string;
  sidebarActive?: string;
  border?: string;
  muted?: string;
  mutedForeground?: string;
  ring?: string;
}

export interface DocumentThemeTokens {
  headerBg?: string;
  headerText?: string;
  accentBorder?: string;
  watermarkOpacity?: number | string;
  printFont?: string;
  stampColor?: string;
}

export interface ThemeConfig {
  mode?: ThemeMode;
  colors?: Partial<ColorTokens>;
  borderRadius?: string;
  fontFamily?: string;
  documentTheme?: DocumentThemeTokens;
}

export interface ThemePreset {
  id: string;
  name: string;
  description?: string;
  config: ThemeConfig;
}

export interface ThemeContextValue {
  theme: ThemeConfig;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  updateTheme: (partialTheme: Partial<ThemeConfig>) => void;
  applyPreset: (presetId: string) => void;
  presets: ThemePreset[];
}
