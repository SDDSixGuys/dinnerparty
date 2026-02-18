import { createContext, useContext, useState, useEffect } from 'react';

export interface ColorScheme {
  name: string;
  sidebar: string;
  sidebarText: string;
  sidebarHover: string;
  sidebarActive: string;
  sidebarBorder: string;
  bg: string;
  text: string;
  textMuted: string;
  accent: string;
  border: string;
  card: string;
  buttonBg: string;
  buttonText: string;
}

export const presets: Record<string, ColorScheme> = {
  default: {
    name: 'Default',
    sidebar: '#ffffff',
    sidebarText: '#000000',
    sidebarHover: '#f5f5f5',
    sidebarActive: '#f0f0f0',
    sidebarBorder: '#e5e5e5',
    bg: '#fafafa',
    text: '#000000',
    textMuted: '#737373',
    accent: '#000000',
    border: '#e5e5e5',
    card: '#ffffff',
    buttonBg: '#000000',
    buttonText: '#ffffff',
  },
  midnight: {
    name: 'Midnight',
    sidebar: '#0a0a0a',
    sidebarText: '#e5e5e5',
    sidebarHover: '#1a1a1a',
    sidebarActive: '#262626',
    sidebarBorder: '#262626',
    bg: '#0f0f0f',
    text: '#e5e5e5',
    textMuted: '#a3a3a3',
    accent: '#e5e5e5',
    border: '#262626',
    card: '#171717',
    buttonBg: '#e5e5e5',
    buttonText: '#0a0a0a',
  },
  warm: {
    name: 'Warm',
    sidebar: '#faf7f2',
    sidebarText: '#44403c',
    sidebarHover: '#f5f0e8',
    sidebarActive: '#ede8df',
    sidebarBorder: '#e7e0d5',
    bg: '#fdfcfa',
    text: '#292524',
    textMuted: '#78716c',
    accent: '#b45309',
    border: '#e7e0d5',
    card: '#faf7f2',
    buttonBg: '#292524',
    buttonText: '#faf7f2',
  },
  ocean: {
    name: 'Ocean',
    sidebar: '#f0f7ff',
    sidebarText: '#1e3a5f',
    sidebarHover: '#e0efff',
    sidebarActive: '#d0e5ff',
    sidebarBorder: '#c8ddf0',
    bg: '#f8fbff',
    text: '#0f2744',
    textMuted: '#5a7a9a',
    accent: '#2563eb',
    border: '#c8ddf0',
    card: '#f0f7ff',
    buttonBg: '#0f2744',
    buttonText: '#f0f7ff',
  },
  forest: {
    name: 'Forest',
    sidebar: '#f2f7f2',
    sidebarText: '#1a3a2a',
    sidebarHover: '#e5f0e5',
    sidebarActive: '#d8e8d8',
    sidebarBorder: '#cce0cc',
    bg: '#f8faf8',
    text: '#1a3a2a',
    textMuted: '#5a7a6a',
    accent: '#16a34a',
    border: '#cce0cc',
    card: '#f2f7f2',
    buttonBg: '#1a3a2a',
    buttonText: '#f2f7f2',
  },
  rose: {
    name: 'Rose',
    sidebar: '#fdf2f4',
    sidebarText: '#4a1d2e',
    sidebarHover: '#fce7ec',
    sidebarActive: '#f9d8e0',
    sidebarBorder: '#f0ccd4',
    bg: '#fef8f9',
    text: '#4a1d2e',
    textMuted: '#8a5a6a',
    accent: '#e11d48',
    border: '#f0ccd4',
    card: '#fdf2f4',
    buttonBg: '#4a1d2e',
    buttonText: '#fdf2f4',
  },
};

interface ThemeContextType {
  theme: ColorScheme;
  themeName: string;
  setTheme: (name: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: presets.default,
  themeName: 'default',
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem('dinnerparty-theme') || 'default';
  });

  const theme = presets[themeName] || presets.default;

  useEffect(() => {
    localStorage.setItem('dinnerparty-theme', themeName);
  }, [themeName]);

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme: setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
}
