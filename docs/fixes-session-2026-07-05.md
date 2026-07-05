# Recallo-Client — Fix Session Log
**Date:** 2026-07-05  
**Scope:** Bug fixes + partial epic implementation (no new features were invented; all changes trace back to the original system specification or are prerequisite plumbing for it)

---

## 1 · Auth Layer — Runtime `SyntaxError` (Critical)

### Root cause
Every Next.js API route that proxied to the Go backend called `.json()` directly on the `Response` object:

```ts
// Before — crashes if Go returns HTML, empty body, or "null\r\n" garbage
const data = await goRes.json();
```

When the Go backend is down, restarting, or returns an HTML error page, `Response.json()` throws:

```
SyntaxError: Unexpected non-whitespace character after JSON at position 4
  at JSON.parse (<anonymous>)
  at async x (.next/server/app/api/auth/refresh/route.js:1:1168)
```

"Position 4" corresponds to `null` + trailing `\r\n` or HTML — a typical Go HTTP error response that is not valid JSON.

### Files changed

#### `src/app/api/auth/refresh/route.ts`
- Added `safeJson(res)` helper: reads `.text()`, returns `null` on empty or unparseable body instead of throwing.
- Full shape validation before trusting `data.data.access_token` / `data.data.refresh_token`.
- Propagates the backend's own `message` field in the 401 error body.
- Clears the stale `refresh_token` cookie on any backend rejection.

```diff
+async function safeJson(res: Response): Promise<unknown> {
+  const text = await res.text();
+  if (!text.trim()) return null;
+  try { return JSON.parse(text); } catch { return null; }
+}
-  const data = await goRes.json() as { success: boolean; ... };
+  const raw = await safeJson(goRes);
+  const data = raw as null | { success?: boolean; data?: {...}; message?: string };
-  if (!goRes.ok || !data.success || !data.data) {
+  if (!goRes.ok || !data?.success || !data.data?.access_token || !data.data?.refresh_token) {
```

#### `src/app/api/auth/me/route.ts`
Same `safeJson` pattern applied. Comment corrected: the `/me` route **does** rotate the refresh token on every call (the Go backend always issues a new one on `/refresh`).

#### `src/app/api/auth/set-cookie/route.ts`
- Replaced `req.json()` (throws on malformed body) with `req.text()` + safe `JSON.parse`.
- Returns a proper `400` JSON response instead of an unhandled 500.

#### `src/hooks/use-current-user.ts`
- `fetchCurrentUser()` no longer calls `res.json()` directly.
- Uses `.text()` then `JSON.parse` in a try/catch, then validates `success`, `access_token`, and `user` presence before returning — any failure throws `Error('Unauthenticated')` which TanStack Query marks as `isError` and triggers `clearAuth()` cleanly.

#### `src/libs/api-client.ts` — 401 interceptor
- The axios interceptor now null-guards `data.data.access_token` and `data.data.user` before trusting the refresh response.
- If the refresh endpoint returns `{ error: 'Token refresh failed' }` (our new 401 shape), the guard throws with that message and the interceptor falls into `catch -> clearAuth -> redirect to /login`.

```diff
+      if (!data?.data?.access_token || !data.data.user) {
+        throw new Error(data?.error ?? 'Token refresh failed');
+      }
```

#### `src/app/[locale]/(auth)/oauth/success/page.tsx`
- Replaced `meRes.json()` with a named `MeData` type alias + safe parse block.
- The previous inline union type caused TypeScript to resolve `typeof meData` as `never`, producing 6 TS2339 errors; using a named alias (`type MeData = {...}`) fixes the narrowing.

---

## 2 · Auth Store — Post-Logout Re-Hydration Loop (Critical)

### Root cause
`clearAuth()` called `set(initialState)` which reset `isHydrated` to `false`. This caused `useCurrentUser`'s query (`enabled: !storeUser && !isHydrated`) to immediately fire a new `/api/auth/refresh` POST after logout — on every navigation away from the login page.

### File changed

#### `src/stores/use-auth-store.ts`

```diff
-  clearAuth: () => set(initialState),
+  // Keep isHydrated:true so useCurrentUser does NOT fire a new /refresh
+  // network call immediately after logout — the auth guard redirects instead.
+  clearAuth: () => set({ ...initialState, isHydrated: true }),
```

---

## 3 · Login & Register Pages — TypeScript `any` Cast

### Files changed

#### `src/app/[locale]/(auth)/login/page.tsx`
#### `src/app/[locale]/(auth)/register/page.tsx`

```diff
-  } catch (e: any) {
-    setServerError(e?.message ?? "Invalid credentials. Try again.");
+  } catch (e: unknown) {
+    const message = e instanceof Error ? e.message : 'Invalid credentials. Try again.';
+    setServerError(message);
```

Eliminates the `any` escape hatch while preserving the same runtime behaviour.

---

## 4 · Next.js Config — Multiple Lockfiles Warning + Type Error

### Root cause 1 — Warning
Next.js walked up from the project root until it found the first `pnpm-lock.yaml`, landing at `/home/dataraj/pnpm-lock.yaml` (the home directory lockfile). This triggered:
```
Detected additional lockfiles:
  * /home/dataraj/.../Recallo-Client/pnpm-lock.yaml
```

### Root cause 2 — TS2353 Type Error
`outputFileTracingRoot` was placed inside `experimental: {}`, but it was promoted to a top-level `NextConfig` field in Next.js 14+:
```
error TS2353: Object literal may only specify known properties, and
'outputFileTracingRoot' does not exist in type 'ExperimentalConfig'.
```

### File changed

#### `next.config.ts`

```diff
+import path from 'node:path';
 ...
 const baseConfig: NextConfig = {
+  // Pin file-tracing root to this project directory so Next.js does not walk
+  // up to /home/dataraj and discover a second pnpm-lock.yaml there.
+  outputFileTracingRoot: path.resolve(import.meta.dirname),
   experimental: {
     turbopackFileSystemCacheForDev: true,
-    outputFileTracingRoot: path.resolve(import.meta.dirname), // wrong position
   },
```

---

## 5 · Global CSS — Theme System (Epic 4)

**Spec reference:** *Epic 4 — Dynamic Theme System & Feature-Specific Theme Diversion*

### Changes in `src/styles/global.css`

#### New chat themes (Sunset, Cyberpunk)
Two additional palettes added to complete the theme picker grid:
- `[data-chat-theme="sunset"]` — warm rose/coral tones
- `[data-chat-theme="cyberpunk"]` — deep indigo/teal neon

#### Per-palette accent RGB channels
Added `--color-chat-accent-rgb` variables for all themes so composer glow animations can use `rgb(var(--color-chat-accent-rgb) / alpha)` without losing the theme colour:

```css
[data-chat-theme="midnight"]  { --color-chat-accent-rgb: 124 158 178; }
[data-chat-theme="sunset"]    { --color-chat-accent-rgb: 255 140 107; }
/* ...etc */
```

#### App-level theme modes (`data-theme` on `<html>`)
```css
[data-theme="dark"]  { /* #12181B background, #1A2226 surface */ }
[data-theme="oled"]  { /* true black, ultra-deep surfaces     */ }
```

#### Feature-specific theme diversion (`data-feature` on the main container)
```css
[data-feature] { transition: background-color 300ms ease, color 300ms ease; }

[data-feature="meeting"] { --color-bg: #0D1117; /* cinematic obsidian    */ }
[data-feature="chat"]    { /* inherits the active chat palette             */ }
[data-feature="dashboard"], [data-feature="archive"] { /* warm accent     */ }
```

#### Semantic colour additions
```css
--color-live:            #34D399;   /* emerald live-status indicator */
--color-live-warn:       #F59E0B;   /* amber recording/warn          */
--color-chat-accent-rgb: 156 197 161; /* base for rgb() alpha glows  */
```

#### Composer micro-animation keyframes
```css
@keyframes recallo-send-glow   { /* pulsing glow on the send button   */ }
@keyframes recallo-input-pulse { /* breathing ring on the active input */ }

@layer utilities {
  .animate-send-glow   { ... }
  .animate-input-pulse { ... }
  .recallo-glass-dark  { backdrop-filter: blur(16px); ... }
}
```

---

## 6 · Theme Provider Refactor (Epic 4)

### File changed: `src/components/providers/theme-provider.tsx`

**Before:** `CHAT_THEMES` stored full hardcoded hex colour objects, duplicating values already defined in CSS.

**After:** `CHAT_THEMES` only stores `{ label, swatch }`. The actual colours live exclusively in `global.css` CSS custom properties keyed by `[data-chat-theme]`. The provider only writes the two attributes to `<html>`; CSS handles all the rest.

New additions:
- `AppTheme` type extended to include `'oled'` (was `'system' | 'dark' | 'light'`).
- `ResolvedMode` type added for the concrete mode after resolving `'system'`.
- `resolveMode()` maps `'system'` to OS preference via `matchMedia`.
- `setChatTheme` persists to `localStorage` under `recallo-chat-theme`.
- `Sunset` and `Cyberpunk` palettes added to `CHAT_THEMES`.
- Context now exposes `theme`, `setTheme`, and `resolvedMode` for consumers.

---

## 7 · Meeting Preferences — Device Persistence (Epic 3)

**Spec reference:** *Epic 3 — Comprehensive Meeting Preferences Persistence*

### Files changed

#### `src/types/meeting.ts`
`LobbyConfig` extended with three optional device ID fields:
```ts
audioDeviceId?: string;
videoDeviceId?: string;
audioOutputDeviceId?: string;
```

#### `src/stores/use-preferences-store.ts`
`theme` type widened to include `'oled'`:
```diff
-theme: 'system' | 'dark' | 'light';
+theme: 'system' | 'light' | 'dark' | 'oled';
```

#### `src/components/meeting/pre-join-lobby.tsx`
- Reads `muteMicOnJoin` / `cameraOffOnJoin` from `usePreferencesStore` to initialise toggle state (instead of hardcoded `true`/`true`).
- Reads `selectedAudioInputId`, `selectedAudioOutputId`, `selectedVideoInputId` from `useMeetingPreferencesStore`.
- `refreshDevices()` enumerates `navigator.mediaDevices.enumerateDevices()` on mount and on device plug/unplug.
- `resolveDevice(saved, list)` — if a saved `deviceId` is no longer present in the enumerated list, resets it to `''` (system default) and fires a `toast()` once per session via `warnedRef`.
- Camera preview uses the saved `videoInputId` when acquiring the stream:
  ```ts
  const constraints = { video: videoInputId ? { deviceId: { exact: videoInputId } } : true };
  ```
- Device selectors (`<select>`) for audio input, audio output, and video input shown in the lobby panel, each writing back to the persisted store on change.

---

## 8 · Meeting Connection Lifecycle — LiveKit Ownership Fix (Epic 2)

**Spec reference:** *Epic 2 — Meeting Persistence (Picture-in-Picture Mode)*

### File changed: `src/components/meeting/live-room.tsx`

**Before:** `LiveRoomImpl` owned the `<LiveKitRoom>` element. Unmounting it (navigating to `/chat` or any other route) immediately disconnected the WebRTC session.

**After:** The LiveKit connection is owned by `ActiveMeetingProvider` hoisted inside `ProtectedLayout` and shared via `RoomContext`. `LiveRoomImpl` renders only the UI shell (`<div data-feature="meeting">`) and reads the room via `@livekit/components-react` hooks. Unmounting `LiveRoomImpl` does **not** drop the call — the provider keeps it alive so the PiP overlay can continue streaming.

```diff
-<LiveKitRoom token={token} serverUrl={serverUrl} connect
-             audio={lobby.micEnabled} video={lobby.camEnabled}
-             onError={handleError} onDisconnected={onLeave}>
-  <RoomAudioRenderer />
-  <RoomSignals />
+<div data-feature="meeting" className="relative flex h-dvh flex-col overflow-hidden">
```

`RoomSignals` (data-channel listeners for in-meeting chat + hand-raise) and `RoomAudioRenderer` are now mounted **once** inside `ActiveMeetingProvider`, not re-mounted on every render of `LiveRoomImpl`.

---

## 9 · New Meeting Tab Opening (Epic 2)

**Spec reference:** *Epic 2 §1 — Meeting Creation in New Browser Tab*

### File changed: `src/hooks/use-room.ts`

**Before:** `createRoom` called `router.push(...)`, navigating the current dashboard tab away from the dashboard.

**After:** Uses `window.open(..., '_blank', 'noopener,noreferrer')` so the meeting opens in a new browser tab. The dashboard tab stays active. `recordRecentRoom` dispatches `RECENT_ROOMS_EVENT` so the sidebar's recent rooms list refreshes in the originating tab without a page reload.

```diff
-router.push(ROUTES.MEETING_DETAIL(newRoom.id));
+window.open(`/${locale}${path}`, '_blank', 'noopener,noreferrer');
```

`useRouter` removed as a dependency of `createRoom`; `useLocale()` from `next-intl` added for correct locale-prefixed path construction.

---

## 10 · TypeScript — Zero Errors Verification

After all changes:

```
$ pnpm exec tsc --noEmit
(no output — 0 errors ✓)
```

---

## Summary Table

| # | File | Category | Severity |
|---|------|----------|----------|
| 1a | `src/app/api/auth/refresh/route.ts` | Auth / JSON safety | 🔴 Critical |
| 1b | `src/app/api/auth/me/route.ts` | Auth / JSON safety | 🔴 Critical |
| 1c | `src/app/api/auth/set-cookie/route.ts` | Auth / JSON safety | 🟠 High |
| 1d | `src/hooks/use-current-user.ts` | Auth / JSON safety | 🔴 Critical |
| 1e | `src/libs/api-client.ts` | Auth / null-guard | 🟠 High |
| 1f | `src/app/[locale]/(auth)/oauth/success/page.tsx` | Auth / JSON safety + TS | 🟠 High |
| 2  | `src/stores/use-auth-store.ts` | Post-logout re-hydration loop | 🔴 Critical |
| 3  | `login/page.tsx`, `register/page.tsx` | TypeScript `any` cast | 🟡 Low |
| 4  | `next.config.ts` | Build warning + TS2353 type error | 🟠 High |
| 5  | `src/styles/global.css` | Epic 4 — theme system CSS | 🟢 Feature |
| 6  | `src/components/providers/theme-provider.tsx` | Epic 4 — theme provider | 🟢 Feature |
| 7  | `pre-join-lobby.tsx`, `use-preferences-store.ts`, `types/meeting.ts` | Epic 3 — device persistence | 🟢 Feature |
| 8  | `src/components/meeting/live-room.tsx` | Epic 2 — PiP connection ownership | 🟢 Feature |
| 9  | `src/hooks/use-room.ts` | Epic 2 — new tab opening | 🟢 Feature |
