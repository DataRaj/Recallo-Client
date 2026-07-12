"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

<<<<<<< Updated upstream
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
=======
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePreferencesStore } from "@/stores/use-preferences-store";

/* ─── Chat palettes (must match the [data-chat-theme] blocks in global.css) ─── */
export const CHAT_THEMES = {
  "recallo-dark": { label: "Recallo Dark", swatch: "#9CC5A1" },
  midnight: { label: "Midnight", swatch: "#7C9EB2" },
  forest: { label: "Forest", swatch: "#89A87D" },
  ocean: { label: "Ocean", swatch: "#3AAFA9" },
  lavender: { label: "Lavender", swatch: "#B8A1FF" },
  sunset: { label: "Sunset", swatch: "#FF8C6B" },
  cyberpunk: { label: "Cyberpunk", swatch: "#23E5DB" },
} as const;

export type ChatThemeKey = keyof typeof CHAT_THEMES;
export type AppTheme = "system" | "light" | "dark" | "oled";
export type ResolvedMode = "light" | "dark" | "oled";

const CHAT_STORAGE_KEY = "recallo-chat-theme";

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  resolvedMode: ResolvedMode;
>>>>>>> Stashed changes
  chatTheme: ChatThemeKey;
  setChatTheme: (theme: ChatThemeKey) => void;
  currentChatTheme: ChatTheme;
};

const ThemeContext = createContext<ThemeContextValue>({
  chatTheme: 'recallo-dark',
  setChatTheme: () => {},
  currentChatTheme: CHAT_THEMES['recallo-dark'],
});

<<<<<<< Updated upstream
/* ─── Provider ─── */
const STORAGE_KEY = 'recallo-chat-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [chatTheme, setChatThemeState] = useState<ChatThemeKey>('recallo-dark');
=======
/** Resolve 'system' to a concrete mode using the OS colour-scheme preference. */
function resolveMode(theme: AppTheme): ResolvedMode {
  if (theme !== "system") return theme;

  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = usePreferencesStore((s) => s.theme);
  const setThemePref = usePreferencesStore((s) => s.set);

  const [chatTheme, setChatThemeState] = useState<ChatThemeKey>("recallo-dark");
  const [resolvedMode, setResolvedMode] = useState<ResolvedMode>(() =>
    resolveMode(theme),
  );
>>>>>>> Stashed changes

  // Hydrate from localStorage
  useEffect(() => {
<<<<<<< Updated upstream
    const stored = localStorage.getItem(STORAGE_KEY) as ChatThemeKey | null;
    if (stored && stored in CHAT_THEMES) {
      setChatThemeState(stored);
    }
  }, []);

  const setChatTheme = (theme: ChatThemeKey) => {
    setChatThemeState(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  };
=======
    const stored = localStorage.getItem(
      CHAT_STORAGE_KEY,
    ) as ChatThemeKey | null;
    if (stored && stored in CHAT_THEMES) setChatThemeState(stored);
  }, []);

  // Apply the app mode to <html>, and keep it in sync with the OS when 'system'.
  useEffect(() => {
    const apply = () => {
      const mode = resolveMode(theme);
      setResolvedMode(mode);
      const el = document.documentElement;
      if (mode === "light") el.removeAttribute("data-theme");
      else el.setAttribute("data-theme", mode);
    };
    apply();

    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  // Apply the chat palette to <html>.
  useEffect(() => {
    document.documentElement.setAttribute("data-chat-theme", chatTheme);
  }, [chatTheme]);

  const setTheme = useCallback(
    (next: AppTheme) => setThemePref("theme", next),
    [setThemePref],
  );

  const setChatTheme = useCallback((next: ChatThemeKey) => {
    setChatThemeState(next);
    localStorage.setItem(CHAT_STORAGE_KEY, next);
  }, []);
>>>>>>> Stashed changes

  console.log("Theme: ", theme, resolvedMode, chatTheme);
  return (
    <ThemeContext.Provider
<<<<<<< Updated upstream
      value={{
        chatTheme,
        setChatTheme,
        currentChatTheme: CHAT_THEMES[chatTheme],
      }}
=======
      value={{ theme, setTheme, resolvedMode, chatTheme, setChatTheme }}
>>>>>>> Stashed changes
    >
      {children}
    </ThemeContext.Provider>
  );
}

<<<<<<< Updated upstream
/* ─── Hook ─── */
export function useTheme() {
  return useContext(ThemeContext);
=======
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
>>>>>>> Stashed changes
}
