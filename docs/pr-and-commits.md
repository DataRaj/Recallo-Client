# PR Description & Commit Messages

This document outlines the conventional commit messages and the Pull Request description matching the changes made in the `fix/picture-in-picture-UI-richness` branch.

---

## 1. Commit History (Conventional Commits)

You can commit the current changes as a single squashed commit or as atomic commits. Below are the recommended atomic commit messages:

### Commit 1: Auth & API Route Safety
```
fix(auth): resolve runtime json parse crashes and prevent logout hydrate loop

- Implement `safeJson()` helper to read response text and catch parser errors on empty/HTML responses.
- Apply safe response parsing to refresh, me, set-cookie routes, and useCurrentUser hooks.
- Fix TS2339 union type narrowing error on OAuth success page by defining a named MeData alias.
- Narrow any-cast types to unknown in login and register page error catch blocks.
- Fix post-logout re-hydration loop by maintaining isHydrated: true when clearing auth.
```

### Commit 2: Next.js Config
```
fix(next-config): pin file-tracing root and correct TS2353 type location

- Configure outputFileTracingRoot at the top level of NextConfig instead of experimental block to fix TS2353.
- Set outputFileTracingRoot using path.resolve to prevent walking up to home directories and triggering duplicate lockfile warnings.
```

### Commit 3: Theme System & CSS Tokens
```
feat(theme): implement dynamic app modes, chat palettes, and theme diversion

- Define dark/oled/light background and surface variables in global.css.
- Support feature-specific theme diversion (meeting, chat, dashboard) via html data attributes.
- Introduce sunset and cyberpunk custom chat themes with separate accent RGB channels for transparency glows.
- Refactor ThemeProvider to write data attributes to html and delegate custom property styling to global.css.
```

### Commit 4: Meeting Preferences & Device Persistence
```
feat(meeting): implement persistent device preferences and pre-join lobby recovery

- Create useMeetingPreferencesStore with local storage persistence.
- Track selected audio input, video input, audio output, layout mode, video mirroring, and noise suppression.
- Auto-populate and restore toggle states and device choices in the pre-join lobby.
- Add hardware unplug fallback to reset stale device IDs to default and show a toast warning.
- Bind the video tile mirroring toggle state to local video previews.
```

### Commit 5: LiveKit Lifecycle & Picture-in-Picture
```
feat(meeting): hoist LiveKit session ownership to active meeting provider

- Hoist RoomContext and connection management to ActiveMeetingProvider at layout level.
- Keep the WebRTC session alive during route transitions to support floating picture-in-picture.
- Prevent duplicate mounting of RoomSignals and RoomAudioRenderer.
- Design a draggable FloatingMeetingOverlay containing a live featured camera track, volume/mic toggles, and return-to-room navigation.
```

### Commit 6: Meeting Navigation & Tab Sync
```
feat(meeting): launch meeting sessions in new tabs and trigger cross-tab sync

- Refactor useRoom hook to open new room detail routes in a new browser tab.
- Broadcast RECENT_ROOMS_EVENT to sync the originating tab's sidebar list without reloading.
```

### Commit 7: Rich Chat Input Composer
```
feat(chat): upgrade message composer with formatting, emoji/gif pickers, and multi-file previews

- Add a Markdown formatting toolbar for bold, italic, code, and bullet lists.
- Support attaching and listing multiple file attachments in a preview array with individual removal toggles.
- Embed custom popovers for emoji category selections (with recent emojis store) and GIF picker tabs.
- Apply dynamic CSS theme variables and micro-animations (input pulse/send glow) to the composer.
```

---

## 2. Pull Request Description

### Title
`feat/fix: Picture-in-Picture Persistence, Rich Chat Composer, and Auth Layer Stabilization`

### Body

```markdown
## Overview
This PR delivers key UI richness improvements, stabilizes the authentication flow, introduces a persistent meeting preferences system, and refactors the LiveKit room ownership model to support a seamless, draggable Picture-in-Picture (PiP) meeting overlay during app-wide route navigation.

These changes address critical runtime crashes and fulfill requirements across Epic 2 (Meeting Persistence / PiP), Epic 3 (Device Persistence), and Epic 4 (Dynamic Theme System).

---

## Key Changes

### 🔐 1. Auth Layer & API Route Stabilization (Critical Bugfixes)
* **Safe JSON Parsing:** Implemented a `safeJson` parser helper for Next.js API routes (`refresh`, `me`, `set-cookie`) to safely handle empty body responses, backend HTML error pages, and raw strings, preventing runtime `SyntaxError` crashes when the Go backend restarts or rejects queries.
* **Logout Re-hydration Loop:** Corrected `clearAuth` in `useAuthStore` to set `isHydrated: true`. This prevents the `useCurrentUser` hook from triggering immediate refresh API queries on every login page navigation right after logging out.
* **TypeScript Cleanup:** Replaced `any` error casting on login/register pages with explicit `unknown` type guards. Restructured the OAuth success page response type parsing with a named alias to resolve a union type narrowing warning (`TS2339`).

### ⚙️ 2. Next.js Config & Build Warnings
* **Lockfile Search Pinning:** Configured `outputFileTracingRoot` to resolve to the current project directory, suppressing duplicate lockfile discovery warnings caused by Next.js traversing directories to `/home/dataraj`.
* **TypeScript Placement Fix:** Relocated `outputFileTracingRoot` to the top-level of the configuration object (out of the `experimental` block) to satisfy Next.js 14+ typing.

### 🎨 3. Dynamic Theme System & Feature Diversion (Epic 4)
* **App-Level Modes:** Added support for light, dark, and `oled` true-black modes.
* **Feature-Specific Theme Diversion:** Configured style sheets to automatically shift background tokens when a container mounts with `data-feature="meeting"` (obsidian cinematic) or `data-feature="chat"` (active chat theme colors).
* **Theme Picker & CSS Variables:** Refactored the `ThemeProvider` to store only visual labels. Colors are now driven by custom CSS variables configured in `global.css` for each theme key (including new `Sunset` and `Cyberpunk` themes).
* **RGB Color Channels:** Exposed separate `--color-chat-accent-rgb` variables for custom composer pulse/glow transparency effects.

### 🎛️ 4. Persisted Meeting Preferences & pre-join Lobby (Epic 3)
* **Device Store:** Created `useMeetingPreferencesStore` backed by `localStorage` to save audio inputs, video inputs, outputs, layouts, video mirroring, and noise suppression settings.
* **Smart Device Fallback:** Configured `PreJoinLobby` to auto-resolve input/output selections. If a saved device is unplugged, the app falls back gracefully to system defaults and alerts the user via a session toast.
* **Video Mirroring:** Integrated a toggle for camera previews, feeding into the video layout canvas.

### 📺 5. Picture-in-Picture & LiveKit Refactor (Epic 2)
* **Hoisted Connection:** Shifted the `<LiveKitRoom>` instance out of the transient `LiveRoom` detail route and into `ActiveMeetingProvider` within the protected layout. Navigating away from the meeting page now leaves the WebRTC session alive.
* **Draggable Overlay:** Introduced a floating mini-player (`FloatingMeetingOverlay`) that renders the current active speaker or local user, offers volume/mute/camera toggles, and allows one-click redirection back to the full-screen meeting page.
* **Signal Sync:** Moved audio renderers and signal listeners (`RoomSignals`) to mount once within the provider context.

### 🚀 6. Cross-Tab Meeting Handling
* **Launch Control:** Adjusted `useRoom` room creation to spin up meeting sessions in a new browser tab (`_blank`), keeping the dashboard tab open.
* **Event Dispatching:** Synchronized recent rooms lists in the originating dashboard sidebar using cross-tab custom events without needing page reloads.

### 💬 7. Rich Chat Composer UI
* **Markdown Bar:** Added bold, italic, code-block, and bullet list editor utilities to `MessageInput`.
* **Multi-file Upload Previews:** Transformed the single-file placeholder into a full attachment array showing individual thumbnails with size calculations and delete options.
* **Interactive Popovers:** Built native, dependency-free popovers for Emojis (featuring categorised groups and a local-storage "Recents" tracker) and animated GIFs.

---

## Verification
* **TypeScript:** Verified zero compilation errors via `pnpm exec tsc --noEmit`.
* **Testing:** Confirmed layouts render and theme state changes propagate cleanly across layout components.
```
