'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

/* ─── Theme definitions ─── */
export const CHAT_THEMES = {
  'recallo-dark': {
    label: 'Recallo Dark',
    bg: '#273338',
    surface: '#324147',
    bubble: '#3C4C52',
    text: '#FBF5DD',
    textSecondary: '#D9D3BC',
    accent: '#9CC5A1',
  },
  'midnight': {
    label: 'Midnight',
    bg: '#161A1D',
    surface: '#1E2428',
    bubble: '#252C30',
    text: '#F5F3F0',
    textSecondary: '#B8B4AC',
    accent: '#7C9EB2',
  },
  'forest': {
    label: 'Forest',
    bg: '#1F2D24',
    surface: '#273320',
    bubble: '#2F3C2A',
    text: '#F3F5E9',
    textSecondary: '#C8CCBA',
    accent: '#89A87D',
  },
  'ocean': {
    label: 'Ocean',
    bg: '#17252A',
    surface: '#1E3038',
    bubble: '#263C45',
    text: '#DEF2F1',
    textSecondary: '#B0CDC9',
    accent: '#3AAFA9',
  },
  'lavender': {
    label: 'Lavender',
    bg: '#25213A',
    surface: '#2E2A45',
    bubble: '#383351',
    text: '#F8F4FF',
    textSecondary: '#C8C0E0',
    accent: '#B8A1FF',
  },
} as const;

export type ChatThemeKey = keyof typeof CHAT_THEMES;
export type ChatTheme = (typeof CHAT_THEMES)[ChatThemeKey];

/* ─── Context ─── */
type ThemeContextValue = {
  chatTheme: ChatThemeKey;
  setChatTheme: (theme: ChatThemeKey) => void;
  currentChatTheme: ChatTheme;
};

const ThemeContext = createContext<ThemeContextValue>({
  chatTheme: 'recallo-dark',
  setChatTheme: () => {},
  currentChatTheme: CHAT_THEMES['recallo-dark'],
});

/* ─── Provider ─── */
const STORAGE_KEY = 'recallo-chat-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [chatTheme, setChatThemeState] = useState<ChatThemeKey>('recallo-dark');

  // Hydrate from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ChatThemeKey | null;
    if (stored && stored in CHAT_THEMES) {
      setChatThemeState(stored);
    }
  }, []);

  const setChatTheme = (theme: ChatThemeKey) => {
    setChatThemeState(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  };

  return (
    <ThemeContext.Provider
      value={{
        chatTheme,
        setChatTheme,
        currentChatTheme: CHAT_THEMES[chatTheme],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/* ─── Hook ─── */
export function useTheme() {
  return useContext(ThemeContext);
}
