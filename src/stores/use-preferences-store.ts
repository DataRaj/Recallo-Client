'use client';

/**
 * usePreferencesStore — persisted user preferences.
 *
 * Backed by localStorage so they survive page reloads.
 * Only UI prefs that have no server counterpart live here.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface UserPreferences {
  /** Chat sidebar width (px) */
  chatSidebarWidth: number;
  /** Sidebar open/closed on desktop */
  sidebarOpen: boolean;
  /** Notification sounds enabled */
  notificationSound: boolean;
  /** Desktop notifications enabled */
  desktopNotifications: boolean;
  /** Chat message density: 'comfortable' | 'compact' */
  messageDensity: 'comfortable' | 'compact';
  /** Whether to send on Enter (vs. require Shift+Enter) */
  sendOnEnter: boolean;
  /** Microphone muted by default on room join */
  muteMicOnJoin: boolean;
  /** Camera off by default on room join */
  cameraOffOnJoin: boolean;
  /** Theme override: 'system' | 'dark' | 'light' */
  theme: 'system' | 'dark' | 'light';
}

interface PreferencesActions {
  set: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  reset: () => void;
}

const DEFAULTS: UserPreferences = {
  chatSidebarWidth: 320,
  sidebarOpen: true,
  notificationSound: true,
  desktopNotifications: false,
  messageDensity: 'comfortable',
  sendOnEnter: true,
  muteMicOnJoin: false,
  cameraOffOnJoin: false,
  theme: 'system',
};

export const usePreferencesStore = create<UserPreferences & PreferencesActions>()(
  devtools(
    persist(
      (set) => ({
        ...DEFAULTS,
        set: (key, value) => set({ [key]: value }),
        reset: () => set(DEFAULTS),
      }),
      { name: 'recallo-preferences' },
    ),
    { name: 'PreferencesStore' },
  ),
);
