import { createContext, useContext, useState, useEffect } from 'react';

const themes = {
  light: {
    name: 'light',
    emoji: '☀️',
    bg: '#FDF8F3',
    bgCard: '#FFFFFF',
    bgSecondary: '#FDF0E0',
    bgNav: '#FFFFFF',
    border: '#EDE5D8',
    borderAccent: '#F5C98A',
    text: '#3D2B1F',
    textMuted: '#A08060',
    textHint: '#C4A882',
    accent: '#F5A623',
    accentEnd: '#E8855A',
    accentText: '#C07820',
    success: '#52A882',
    danger: '#E8855A',
    streak: '#FDF0E0',
    streakText: '#C4A882',
    navActive: '#F5A623',
    shadow: 'rgba(210,140,80,0.15)',
  },
  dark: {
    name: 'dark',
    emoji: '🌙',
    bg: '#1C1410',
    bgCard: '#2A1F18',
    bgSecondary: '#362820',
    bgNav: '#221A14',
    border: '#3D2E24',
    borderAccent: '#6B4A30',
    text: '#F5EDE3',
    textMuted: '#A08070',
    textHint: '#6B5040',
    accent: '#F5A623',
    accentEnd: '#E8855A',
    accentText: '#F5C070',
    success: '#5BBF8F',
    danger: '#E8855A',
    streak: '#362820',
    streakText: '#A08070',
    navActive: '#F5A623',
    shadow: 'rgba(0,0,0,0.4)',
  },
  green: {
    name: 'green',
    emoji: '🌿',
    bg: '#F4F8F2',
    bgCard: '#FFFFFF',
    bgSecondary: '#E8F2E4',
    bgNav: '#FFFFFF',
    border: '#D4E8CC',
    borderAccent: '#A8CC90',
    text: '#1E3A1E',
    textMuted: '#5A7A50',
    textHint: '#8AAA80',
    accent: '#4CAF50',
    accentEnd: '#2E7D32',
    accentText: '#2E7D32',
    success: '#43A047',
    danger: '#E57373',
    streak: '#E8F2E4',
    streakText: '#5A7A50',
    navActive: '#4CAF50',
    shadow: 'rgba(76,175,80,0.15)',
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() => localStorage.getItem('theme') || 'light');
  const theme = themes[themeName] || themes.light;

  const cycleTheme = () => {
    const order = ['light', 'dark', 'green'];
    const next = order[(order.indexOf(themeName) + 1) % order.length];
    setThemeName(next);
    localStorage.setItem('theme', next);
  };

  useEffect(() => {
    document.body.style.background = theme.bg;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeName, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
