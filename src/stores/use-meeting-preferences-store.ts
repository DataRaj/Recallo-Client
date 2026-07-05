'use client';

/**
 * useMeetingPreferencesStore — persisted meeting/device preferences.
 *
 * Backed by localStorage (`recallo-meeting-preferences`) so device choices and
 * layout defaults survive tab closures, reloads, and reboots. Restored in the
 * pre-join lobby and applied when the active-meeting connection is established.
 *
 * Mirrors the pattern in `use-preferences-store.ts`.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type LayoutMode = 'grid' | 'focus' | 'speaker';
export type BackgroundEffect = 'none' | 'blur' | 'virtual';
export type DefaultSidebarTab = 'none' | 'chat' | 'people';

export interface MeetingPreferences {
  /** Preferred microphone device ID (empty = system default). */
  selectedAudioInputId: string;
  /** Preferred speaker/output device ID (empty = system default). */
  selectedAudioOutputId: string;
  /** Preferred camera device ID (empty = system default). */
  selectedVideoInputId: string;
  /** Default stage layout when joining. */
  defaultLayoutMode: LayoutMode;
  /** Max camera tiles rendered per page in the grid. */
  maxTilesPerPage: number;
  /** Mirror the local camera preview/tile. */
  mirrorVideo: boolean;
  /** Enable noise suppression on the captured microphone track. */
  noiseSuppression: boolean;
  /** Camera background effect (processing wired as a follow-up). */
  backgroundEffect: BackgroundEffect;
  /** Sidebar tab to open automatically on join. */
  defaultSidebarTab: DefaultSidebarTab;
}

interface MeetingPreferencesActions {
  set: <K extends keyof MeetingPreferences>(key: K, value: MeetingPreferences[K]) => void;
  reset: () => void;
}

const DEFAULTS: MeetingPreferences = {
  selectedAudioInputId: '',
  selectedAudioOutputId: '',
  selectedVideoInputId: '',
  defaultLayoutMode: 'grid',
  maxTilesPerPage: 9,
  mirrorVideo: true,
  noiseSuppression: true,
  backgroundEffect: 'none',
  defaultSidebarTab: 'none',
};

export const useMeetingPreferencesStore = create<MeetingPreferences & MeetingPreferencesActions>()(
  devtools(
    persist(
      set => ({
        ...DEFAULTS,
        set: (key, value) => set({ [key]: value }),
        reset: () => set(DEFAULTS),
      }),
      { name: 'recallo-meeting-preferences' },
    ),
    { name: 'MeetingPreferencesStore' },
  ),
);
