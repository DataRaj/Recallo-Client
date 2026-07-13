"use client";

/**
 * ThemeProvider — drives the app's visual mode and per-conversation chat palette.
 *
 * Applies two attributes to <html>:
 *   - `data-theme`      ← app mode (dark | oled), resolved from
 *                         usePreferencesStore.theme ('system' follows the OS;
 *                         'light' clears the attribute → base tokens).
 *   - `data-chat-theme` ← selected chat palette (see CHAT_THEMES).
 *
 * The actual colour values live as CSS custom properties in `global.css`; this
 * provider only toggles the attributes those selectors key off.
 */

import React, {
  createContext,
  use,
  useCallback,
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
export type AppTheme = "system" | "light" | "dark";
export type ResolvedMode = "light" | "dark";

const CHAT_STORAGE_KEY = "recallo-chat-theme";

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  resolvedMode: ResolvedMode;
  chatTheme: ChatThemeKey;
  setChatTheme: (theme: ChatThemeKey) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/** Resolve 'system' to a concrete mode using the OS colour-scheme preference. */
function resolveMode(theme: AppTheme): ResolvedMode {
  if (theme !== "system") {
    return theme;
  }

  if (typeof window === "undefined") {
    return "light";
  }
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

  // Hydrate the chat palette from localStorage.
  useEffect(() => {
    const stored = localStorage.getItem(
      CHAT_STORAGE_KEY,
    ) as ChatThemeKey | null;
    if (stored && stored in CHAT_THEMES) {
      setChatThemeState(stored);
    }
  }, []);

  // Apply the app mode to <html>, and keep it in sync with the OS when 'system'.
  useEffect(() => {
    const apply = () => {
      const mode = resolveMode(theme);
      setResolvedMode(mode);
      const el = document.documentElement;
      if (mode === "light") {
        el.removeAttribute("data-theme");
      } else {
        el.setAttribute("data-theme", mode);
      }
    };
    apply();

    if (theme !== "system") {
      return;
    }
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

  console.log("Theme: ", theme, resolvedMode, chatTheme);
  return (
    <ThemeContext
      value={{ theme, setTheme, resolvedMode, chatTheme, setChatTheme }}
    >
      {children}
    </ThemeContext>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = use(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
