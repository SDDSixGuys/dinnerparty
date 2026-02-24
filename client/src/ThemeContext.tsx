import { createContext, useContext, useState, useEffect } from 'react';

export type FontSize = 'smallest' | 'small' | 'default' | 'large' | 'largest';

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
    sidebar: '#23324a',
      sidebarText: '#ffffff',
      sidebarHover: '#2d3f5d',
      sidebarActive: '#364b6f',
      sidebarBorder: '#1a2638',
      bg: '#1b2638',
      text: '#ffffff',
      textMuted: '#94a3b8',
      accent: '#60a5fa',
      border: '#2d3f5d',
      card: '#23324a',
      buttonBg: '#60a5fa',
      buttonText: '#1b2638',
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
  nord: {
    name: 'Nord',
    sidebar: '#2e3440',
    sidebarText: '#eceff4',
    sidebarHover: '#3b4252',
    sidebarActive: '#434c5e',
    sidebarBorder: '#434c5e',
    bg: '#3b4252',
    text: '#eceff4',
    textMuted: '#d8dee9',
    accent: '#88c0d0',
    border: '#4c566a',
    card: '#2e3440',
    buttonBg: '#88c0d0',
    buttonText: '#2e3440',
  },
  dracula: {
    name: 'Dracula',
    sidebar: '#282a36',
    sidebarText: '#f8f8f2',
    sidebarHover: '#44475a',
    sidebarActive: '#6272a4',
    sidebarBorder: '#44475a',
    bg: '#1e1f29',
    text: '#f8f8f2',
    textMuted: '#6272a4',
    accent: '#bd93f9',
    border: '#44475a',
    card: '#282a36',
    buttonBg: '#ff79c6',
    buttonText: '#282a36',
  },
  sepia: {
    name: 'Sepia',
    sidebar: '#efe7d5',
    sidebarText: '#5f4b32',
    sidebarHover: '#e6dac3',
    sidebarActive: '#ddd0b3',
    sidebarBorder: '#d3c5a1',
    bg: '#f4ecd8',
    text: '#5f4b32',
    textMuted: '#8c7a61',
    accent: '#964b00',
    border: '#d3c5a1',
    card: '#efe7d5',
    buttonBg: '#5f4b32',
    buttonText: '#efe7d5',
  },
  cyber: {
    name: 'Cyber',
    sidebar: '#000000',
    sidebarText: '#00ff00',
    sidebarHover: '#001a00',
    sidebarActive: '#003300',
    sidebarBorder: '#00ff00',
    bg: '#050505',
    text: '#00ff00',
    textMuted: '#008000',
    accent: '#000',
    border: '#00ff00',
    card: '#000000',
    buttonBg: '#00ff00',
    buttonText: '#00ff00',
  },
  slate: {
    name: 'Slate',
    sidebar: '#f8fafc',
    sidebarText: '#1e293b',
    sidebarHover: '#f1f5f9',
    sidebarActive: '#e2e8f0',
    sidebarBorder: '#cbd5e1',
    bg: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
    accent: '#334155',
    border: '#e2e8f0',
    card: '#f8fafc',
    buttonBg: '#0f172a',
    buttonText: '#ffffff',
  },
  carbon: {
    name: 'Carbon',
    sidebar: '#292929',
    sidebarText: '#f2f2f2',
    sidebarHover: '#333333',
    sidebarActive: '#3d3d3d',
    sidebarBorder: '#3d3d3d',
    bg: '#323232',
    text: '#f2f2f2',
    textMuted: '#666666',
    accent: '#f66e0d',
    border: '#3d3d3d',
    card: '#292929',
    buttonBg: '#f66e0d',
    buttonText: '#292929',
  },
  miami_vice: {
    name: 'Miami Vice',
    sidebar: '#24212b',
    sidebarText: '#f35588',
    sidebarHover: '#2d2936',
    sidebarActive: '#373242',
    sidebarBorder: '#05d9e8', // Signature light blue border
    bg: '#181819',
    text: '#05d9e8', // Signature light blue text
    textMuted: '#676767',
    accent: '#f35588',
    border: '#373242',
    card: '#24212b',
    buttonBg: '#05d9e8',
    buttonText: '#181819',
  },
  vaporwave: {
    name: 'Vaporwave',
    sidebar: '#2d1b4d',
    sidebarText: '#ff71ce',
    sidebarHover: '#3d2566',
    sidebarActive: '#4d2f80',
    sidebarBorder: '#01cdfe',
    bg: '#1a0f2e',
    text: '#fff',
    textMuted: '#b967ff',
    accent: '#05ffa1',
    border: '#4d2f80',
    card: '#2d1b4d',
    buttonBg: '#ff71ce',
    buttonText: '#1a0f2e',
  },
  watermelon_punch: {
    name: 'Watermelon Punch',
    sidebar: '#2b3a2f',
    sidebarText: '#ff4d6d',
    sidebarHover: '#36493b',
    sidebarActive: '#415847',
    sidebarBorder: '#415847',
    bg: '#1e2b22', // Deep forest green background
    text: '#ff4d6d', // Bright melon pink
    textMuted: '#70a27d',
    accent: '#39ff14', // Neon lime
    border: '#415847',
    card: '#2b3a2f',
    buttonBg: '#ff4d6d',
    buttonText: '#1e2b22',
  },
  cyber_punk: {
    name: 'Cyberpunk',
    sidebar: '#000b1e',
    sidebarText: '#ffee00',
    sidebarHover: '#001a3d',
    sidebarActive: '#002a5c',
    sidebarBorder: '#ff003c',
    bg: '#00050d',
    text: '#ffee00',
    textMuted: '#00ccff',
    accent: '#ff003c',
    border: '#002a5c',
    card: '#000b1e',
    buttonBg: '#ff003c',
    buttonText: '#00050d',
  },
  8008: {
    name: '8008', // Based on the classic dark teal/pink keycap set
    sidebar: '#333a45',
    sidebarText: '#f44c7f',
    sidebarHover: '#3e4652',
    sidebarActive: '#48525f',
    sidebarBorder: '#48525f',
    bg: '#2e343d',
    text: '#939eae',
    textMuted: '#5c6370',
    accent: '#f44c7f',
    border: '#48525f',
    card: '#333a45',
    buttonBg: '#f44c7f',
    buttonText: '#2e343d',
  },
  matcha: {
    name: 'Matcha',
    sidebar: '#3b4b3b',
    sidebarText: '#ecf0f1',
    sidebarHover: '#485c48',
    sidebarActive: '#546d54',
    sidebarBorder: '#546d54',
    bg: '#2e3b2e', // Earthy green background
    text: '#ecf0f1',
    textMuted: '#a3b18a',
    accent: '#f9e076',
    border: '#546d54',
    card: '#3b4b3b',
    buttonBg: '#f9e076',
    buttonText: '#2e3b2e',
  },
  lavender: {
    name: 'Lavender',
    sidebar: '#4a4458',
    sidebarText: '#e6e1f3',
    sidebarHover: '#564f66',
    sidebarActive: '#625a74',
    sidebarBorder: '#625a74',
    bg: '#353140', // Muted deep purple-tinted background
    text: '#e6e1f3',
    textMuted: '#9a94ad',
    accent: '#d0bcff',
    border: '#625a74',
    card: '#4a4458',
    buttonBg: '#d0bcff',
    buttonText: '#353140',
  },
  terracotta: {
    name: 'Terracotta',
    sidebar: '#5d3a3a',
    sidebarText: '#f5e6e6',
    sidebarHover: '#6e4545',
    sidebarActive: '#7f5050',
    sidebarBorder: '#7f5050',
    bg: '#452b2b', // Warm, clay-red tinted background
    text: '#f5e6e6',
    textMuted: '#a38181',
    accent: '#ffb4ab',
    border: '#7f5050',
    card: '#5d3a3a',
    buttonBg: '#ffb4ab',
    buttonText: '#452b2b',
  },
  denim: {
    name: 'Denim',
    sidebar: '#2b3648',
    sidebarText: '#d6e2ff',
    sidebarHover: '#354359',
    sidebarActive: '#3f506a',
    sidebarBorder: '#3f506a',
    bg: '#1e2532', // Deep navy-teal background
    text: '#d6e2ff',
    textMuted: '#8e9bb3',
    accent: '#adc6ff',
    border: '#3f506a',
    card: '#2b3648',
    buttonBg: '#adc6ff',
    buttonText: '#1e2532',
  },
  olive: {
    name: 'Olive',
    sidebar: '#424a2f',
    sidebarText: '#e3e6d8',
    sidebarHover: '#505a39',
    sidebarActive: '#5e6943',
    sidebarBorder: '#5e6943',
    bg: '#313723', // Earthy olive background
    text: '#e3e6d8',
    textMuted: '#949a83',
    accent: '#c0ca33',
    border: '#5e6943',
    card: '#424a2f',
    buttonBg: '#c0ca33',
    buttonText: '#313723',
  },
  dusk: {
    name: 'Dusk',
    sidebar: '#3d3b50',
    sidebarText: '#f0f0f5',
    sidebarHover: '#494760',
    sidebarActive: '#555270',
    sidebarBorder: '#555270',
    bg: '#2d2b3a', // Cool, slate-purple background
    text: '#f0f0f5',
    textMuted: '#a5a2bf',
    accent: '#ffafcc',
    border: '#555270',
    card: '#3d3b50',
    buttonBg: '#ffafcc',
    buttonText: '#2d2b3a',
  },
  desert: {
    name: 'Desert',
    sidebar: '#52463e',
    sidebarText: '#f7ede2',
    sidebarHover: '#63554b',
    sidebarActive: '#746458',
    sidebarBorder: '#746458',
    bg: '#3d342e', // Rich, sandy-brown background
    text: '#f7ede2',
    textMuted: '#bda694',
    accent: '#f2cc8f',
    border: '#746458',
    card: '#52463e',
    buttonBg: '#f2cc8f',
    buttonText: '#3d342e',
  },
  honey: {
    name: 'Honey',
    sidebar: '#fdb022',
    sidebarText: '#42210b',
    sidebarHover: '#fac515',
    sidebarActive: '#eaaa08',
    sidebarBorder: '#b54708',
    bg: '#7a2e0e', // Deep amber background
    text: '#fef3c7',
    textMuted: '#d97706',
    accent: '#fef3c7',
    border: '#92400e',
    card: '#92400e',
    buttonBg: '#fef3c7',
    buttonText: '#42210b',
  },
  sweden: {
    name: 'Sweden',
    sidebar: '#005293',
    sidebarText: '#fecc00',
    sidebarHover: '#005eb8',
    sidebarActive: '#0066cc',
    sidebarBorder: '#fecc00',
    bg: '#00457c',
    text: '#fecc00',
    textMuted: '#80b3ff',
    accent: '#fecc00',
    border: '#005eb8',
    card: '#005293',
    buttonBg: '#fecc00',
    buttonText: '#00457c',
  },
  mocha: {
    name: 'Mocha',
    sidebar: '#3c2a21',
    sidebarText: '#e5e5cb',
    sidebarHover: '#4f392f',
    sidebarActive: '#5f4b41',
    sidebarBorder: '#5f4b41',
    bg: '#1a120b', // Dark espresso base
    text: '#d5cea3',
    textMuted: '#7c6d5d',
    accent: '#e5e5cb',
    border: '#3c2a21',
    card: '#3c2a21',
    buttonBg: '#d5cea3',
    buttonText: '#1a120b',
  },
  red_bull: {
    name: 'Red Bull',
    sidebar: '#001d3d',
    sidebarText: '#ffffff',
    sidebarHover: '#003566',
    sidebarActive: '#001d3d',
    sidebarBorder: '#ff0000',
    bg: '#e5e5e5', // Racing silver/grey background
    text: '#001d3d',
    textMuted: '#5c6d7e',
    accent: '#ff0000', // Racing Red
    border: '#003566',
    card: '#ffffff',
    buttonBg: '#ffd60a', // Bull Yellow
    buttonText: '#001d3d',
  },
  salmon: {
    name: 'Salmon',
    sidebar: '#ff8a8a',
    sidebarText: '#4a1d1d',
    sidebarHover: '#ff9999',
    sidebarActive: '#ff7a7a',
    sidebarBorder: '#e57373',
    bg: '#2d1b1b', // Deep cooked salmon/dark wood background
    text: '#ffadaa',
    textMuted: '#a37c7c',
    accent: '#ff8a8a',
    border: '#4a2c2c',
    card: '#3d2525',
    buttonBg: '#ff8a8a',
    buttonText: '#2d1b1b',
  },
  mcdonalds: {
    name: 'Golden Arches',
    sidebar: '#bd0018',
    sidebarText: '#ffbc0d',
    sidebarHover: '#ffbc0d',
    sidebarActive: '#9e0014',
    sidebarBorder: '#ffbc0d',
    bg: '#bd0018',
    text: '#27251f',
    textMuted: '#fff',
    accent: '#ffbc0d',
    border: '#dddddd',
    card: '#bd0018',
    buttonBg: '#ffbc0d',
    buttonText: '#ffffff',
  },
  copper: {
    name: 'Copper',
    sidebar: '#3d2b1f',
    sidebarText: '#d97706',
    sidebarHover: '#4d3a2d',
    sidebarActive: '#5c483b',
    sidebarBorder: '#b45309',
    bg: '#1c140d',
    text: '#f59e0b',
    textMuted: '#78350f',
    accent: '#ea580c',
    border: '#4d3a2d',
    card: '#2d1e16',
    buttonBg: '#ea580c',
    buttonText: '#1c140d',
  },
  red_dragon: {
    name: 'Red Dragon',
    sidebar: '#1a0000',
    sidebarText: '#ff4d4d',
    sidebarHover: '#2d0000',
    sidebarActive: '#400000',
    sidebarBorder: '#ff0000',
    bg: '#0d0000', // Near-black crimson
    text: '#ff4d4d',
    textMuted: '#800000',
    accent: '#ff0000',
    border: '#400000',
    card: '#1a0000',
    buttonBg: '#ff0000',
    buttonText: '#ffffff',
  },
  osaka: {
    name: 'Solarized Osaka',
    sidebar: '#002b36',
    sidebarText: '#859900',
    sidebarHover: '#073642',
    sidebarActive: '#586e75',
    sidebarBorder: '#2aa198',
    bg: '#fdf6e3', // Classic solarized light background
    text: '#073642',
    textMuted: '#93a1a1',
    accent: '#cb4b16',
    border: '#eee8d5',
    card: '#eee8d5',
    buttonBg: '#268bd2',
    buttonText: '#fdf6e3',
  },
  void: {
    name: 'Ultra Void',
    sidebar: '#050505',
    sidebarText: '#333333',
    sidebarHover: '#0a0a0a',
    sidebarActive: '#0f0f0f',
    sidebarBorder: '#1a1a1a',
    bg: '#000000',
    text: '#444444', // Ghostly grey text
    textMuted: '#222222',
    accent: '#ffffff', // Single point of light
    border: '#111111',
    card: '#030303',
    buttonBg: '#ffffff',
    buttonText: '#000000',
  },
};

interface ThemeContextType {
  theme: ColorScheme;
  themeName: string;
  setTheme: (name: string) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: presets.default,
  themeName: 'default',
  setTheme: () => {},
  fontSize: 'default',
  setFontSize: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem('dinnerparty-theme') || 'default';
  });

  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem('dinnerparty-fontsize') as FontSize) || 'default';
  });

  const theme = presets[themeName] || presets.default;

  useEffect(() => {
    const fontSizeMap = {
      smallest: '12px',
      small: '14px',
      default: '16px',
      large: '18px',
      largest: '20px',
    };

    // This updates the <html> tag, which makes all Tailwind 'rem' units scale
    document.documentElement.style.transition = 'font-size 0.3s ease-out';
    document.documentElement.style.fontSize = fontSizeMap[fontSize];
    localStorage.setItem('dinnerparty-fontsize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('dinnerparty-theme', themeName);
  }, [themeName]);

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme: setThemeName, fontSize, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
}
