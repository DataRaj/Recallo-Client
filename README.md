# Current Changed Files and Comments

## extract_comments.js

*(No top-level block comment found)*

## src/components/meeting/avatar.ts

```typescript
/**
 * Deterministic avatar helpers shared by tiles, chat, and the people list,
 * so the same participant always gets the same initials + accent color.
 */
```

## src/components/meeting/chat-sidebar.tsx

```typescript
/**
 * ChatSidebar — live in-meeting chat over the LiveKit data channel.
 *
 * Messages come from the meeting store (written by useMeetingChat even while
 * this is unmounted). The input is local state + useDeferredValue so typing
 * never touches the store or the video grid. Auto-scrolls to the newest message
 * via useLayoutEffect (DOM measurement).
 */
```

## src/components/meeting/connection-overlay.tsx

```typescript
/**
 * ConnectionOverlay — full-screen status for reconnecting / disconnected
 * states, driven by LiveKit's connection state. Hidden while connected.
 */
```

## src/components/meeting/control-button.tsx

```typescript
/**
 * ControlButton — dock button. Supports active/danger/disabled and a busy
 * spinner. `comingSoon` renders it disabled with a "coming soon" tooltip for
 * features without backend support yet (Record / Transcript / Summary / Share /
 * Hand-raise in Phase 1).
 */
```

## src/components/meeting/controls-dock.tsx

```typescript
/**
 * ControlsDock — bottom control bar.
 *
 * Mic/Camera toggle the real local tracks. Extend / End are wired to the room
 * service (host only). Chat / People drive the sidebar via the meeting store.
 * Share / Record / Transcript / Summary / Hand-raise are rendered disabled
 * ("coming soon") until backend support lands (Phase 2+).
 *
 * Memoized; it subscribes to the meeting store for sidebar/unread state only,
 * so its re-renders never reach the video grid.
 */
```

## src/components/meeting/focus-view.tsx

```typescript
/**
 * FocusView — screen-share-first layout: the shared screen fills the stage and
 * camera tiles shift to a horizontal filmstrip below it. Memoized.
 */
```

## src/components/meeting/invite-button.tsx

```typescript
/**
 * InviteButton — copies a shareable room link to the clipboard.
 *
 * Builds an absolute URL from the current origin + locale so the recipient
 * lands on the same room (rooms are public by id; login is enforced in-app).
 */
```

## src/components/meeting/live-room.tsx

```typescript
/**
 * LiveRoom — the single <LiveKitRoom> host.
 *
 * Mounted once and never remounted by UI-chrome state, so the WebRTC
 * connection survives sidebar toggles. Lays out header + grid + dock + sidebar;
 * <VideoGrid/> and <SidebarSlot/> are siblings, and only the slot subscribes to
 * the store, so chat/people toggles never re-render the grid.
 */
```

## src/components/meeting/meeting-gate.tsx

*(No top-level block comment found)*

## src/components/meeting/meeting-header.tsx

*(No top-level block comment found)*

## src/components/meeting/meeting-stage.tsx

*(No top-level block comment found)*

## src/components/meeting/people-sidebar.tsx

*(No top-level block comment found)*

## src/components/meeting/pre-join-lobby.tsx

```typescript
/**
 * PreJoinLobby — device check + name confirmation before connecting.
 *
 * Validates the display name against DisplayNameSchema, lets the user toggle
 * initial mic/cam, and shows a live camera preview via getUserMedia (with a
 * permission-denied fallback). On Join it stops the preview stream and hands a
 * LobbyConfig to the parent, which fetches the token and connects.
 */
```

## src/components/meeting/sidebar-slot.tsx

```typescript
/**
 * SidebarSlot — the ONLY component that subscribes to `store.sidebar`.
 *
 * Isolating the subscription here means toggling chat/people re-renders just
 * this slot, never the sibling <VideoGrid/>.
 */
```

## src/components/meeting/video-grid.tsx

```typescript
/**
 * VideoGrid — maps live camera tracks (incl. placeholders for camera-off
 * participants) into tiles, with a column count computed from the participant
 * count. Memoized and store-agnostic: toggling the chat/people sidebar never
 * re-renders it.
 */
```

## src/components/meeting/video-tile.tsx

```typescript
/**
 * VideoTile — one participant cell driven by a real LiveKit TrackReference.
 *
 * Reads speaking / mic / camera / connection-quality straight from the SDK.
 * Memoized so unrelated grid or chrome re-renders don't touch it; the <video>
 * element is preserved across grid recomputes because tiles key on identity.
 */
```

## src/hooks/use-hand-raise.ts

```typescript
/**
 * Hand-raise over the LiveKit data channel.
 *
 * State is ephemeral (data channel only), so two pieces keep everyone in sync:
 *  - useHandRaiseSync(): mounted ONCE in the room. Receives hand signals,
 *    prunes hands on disconnect, and re-broadcasts the local hand to anyone who
 *    joins later (so late joiners learn existing raised hands).
 *  - useHandRaiseControl(): used by the dock. Exposes the local raised flag and
 *    a toggle that publishes + updates the store optimistically.
 *
 * Both must run inside a <LiveKitRoom>.
 */
```

## src/hooks/use-is-recording.ts

```typescript
/**
 * useIsRecording — reflects LiveKit's room recording state (driven by egress).
 * Recording is started server-side/automatically; this is read-only.
 * Must run inside a <LiveKitRoom>.
 */
```

## src/hooks/use-media-toggles.ts

```typescript
/**
 * useMediaToggles — wraps the local participant's mic/camera track toggles.
 *
 * Reads authoritative enabled-state from LiveKit (never mirrored into app
 * state) and exposes async togglers that surface permission/device errors as
 * toasts. Must be used inside a <LiveKitRoom> (uses useLocalParticipant).
 */
```

## src/hooks/use-meeting-chat.ts

```typescript
/**
 * In-meeting chat over the LiveKit data channel.
 *
 *  - useChatReceiver(): mounted ONCE in the room so messages arrive (and the
 *    unread badge increments) even while the chat sidebar is closed.
 *  - useChatSender(): used by the sidebar. publishData(reliable) on CHAT_TOPIC,
 *    then locally echoes the outgoing message (LiveKit does not loop a
 *    participant's own data back).
 *
 * Both must run inside a <LiveKitRoom> (use useRoomContext).
 */
```

## src/hooks/use-meeting-connection.ts

```typescript
/**
 * useMeetingConnection — resolves everything needed before connecting:
 * fetches the room, derives the guest identity + host flag, and exposes a
 * `fetchToken` action the lobby calls with the confirmed display name.
 *
 * Note on identity: the backend mints the LiveKit identity from the `guest_id`
 * we send, and host detection compares `room.host_guest_id === guestId`. Even
 * with login now required at the route gate, we keep the existing guest UUID as
 * the identity for backward-compat. (Keying host on the authenticated user id
 * is a backend change tracked separately.)
 */
```

## src/hooks/use-session-timer.ts

```typescript
/**
 * useSessionTimer — derives the live countdown from room timing.
 *
 * Kept as its own hook (consumed only by the header) so the per-second tick
 * re-renders the header, NOT the meeting gate or the video grid. On expiry it
 * notifies and routes home; unmounting the room tears down the LiveKit
 * connection.
 */
```

## src/schemas/meeting.schema.ts

```typescript
/**
 * Display name shown to other participants.
 * 2–50 chars, letters / spaces / hyphens only (per product spec).
 */
```

## src/stores/use-meeting-store.ts

```typescript
/**
 * Meeting UI store — chrome state + chat buffer ONLY.
 *
 * Deliberately holds NO LiveKit track/participant state (that lives in the
 * LiveKit hooks, the source of truth). Keeping the chat buffer + sidebar tab
 * here lets the chat data-channel handler push messages even while the sidebar
 * is unmounted, and lets only the thin <SidebarSlot/> subscribe to `sidebar`
 * so toggling chat/people never re-renders the memoized video grid.
 */
```

## src/types/meeting.ts

```typescript
/**
 * Meeting room types — LiveKit DataChannel chat + lobby/connection shapes.
 *
 * In-meeting chat travels over the LiveKit data channel (not the Go WS hub,
 * which is a JWT-gated 1-on-1 DM system). Messages are JSON-encoded as a
 * versioned ChatEnvelope, namespaced by CHAT_TOPIC so future features
 * (reactions, hand-raise) can share the same channel.
 */
```

## src/utils/identity.ts

```typescript
/**
 * Meeting identity convention.
 *
 * Login is required to enter a room, so we encode the authenticated user id
 * into the LiveKit identity as `u<id>`. This lets other participants map an
 * in-call person back to a Recallo user (e.g. to start a DM). Guests (no auth)
 * fall back to the persistent guest UUID.
 *
 * The same value is used as `guest_id` for room creation, token issuance, and
 * host detection so they stay consistent.
 */
```

## src/app/[locale]/meeting/[roomId]/page.tsx

*(No top-level block comment found)*

## src/hooks/use-auth.ts

```typescript
/**
 * useAuth — Provides login, register, and logout actions.
 *
 * - Login / Register: POSTs to the Go backend, stores access_token in Zustand,
 *   then calls /api/auth/set-cookie to persist refresh_token as httpOnly cookie.
 * - Logout: Calls /api/auth/logout to clear the cookie, clears Zustand store.
 */
```

## src/hooks/use-room.ts

```typescript
/**
 * useRoom — Hook for room operations (create, join, list, etc.)
 */
```

