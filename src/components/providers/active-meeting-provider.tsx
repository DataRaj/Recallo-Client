"use client";

/**
 * ActiveMeetingProvider — the single, app-wide home for a live meeting.
 *
 * Why it exists: the meeting route (`/[locale]/meeting/[roomId]`) lives OUTSIDE
 * the `(protected)` route group, while the app's other pages (`/home`, `/chat`…)
 * live inside it. Their only common ancestor is the root `[locale]/layout.tsx`.
 * Mounting the LiveKit connection here — rather than inside the meeting page —
 * means the connection survives navigation between the meeting and the rest of
 * the app, enabling the floating Picture-in-Picture mini-player.
 *
 * It owns one imperative `livekit-client` Room and shares it through LiveKit's
 * `RoomContext`, so every `@livekit/components-react` hook keeps working whether
 * rendered full-screen (meeting page) or inside the PiP overlay.
 */

import type { ReactNode } from "react";
import type { LobbyConfig } from "@/types/meeting";
import type { Room as RoomMeta } from "@/types/room";
import { RoomAudioRenderer, RoomContext } from "@livekit/components-react";
import { ConnectionState, Room, RoomEvent } from "livekit-client";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { FloatingMeetingOverlay } from "@/components/meeting/floating-meeting-overlay";
import { PersistentRoomSignals } from "@/components/meeting/persistent-room-signals";
import { ROUTES } from "@/lib/routes";
import { useMeetingPreferencesStore } from "@/stores/use-meeting-preferences-store";
import { useMeetingStore } from "@/stores/use-meeting-store";

export type MeetingStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting";

export type ActiveMeetingSession = {
  roomId: string;
  roomMeta: RoomMeta;
  mode: "meeting" | "webinar";
  isHost: boolean;
  guestId: string;
  displayName: string;
};

export type ConnectParams = {
  roomId: string;
  token: string;
  serverUrl: string;
  lobby: LobbyConfig;
  roomMeta: RoomMeta;
  isHost: boolean;
  guestId: string;
  mode: "meeting" | "webinar";
};

type ActiveMeetingContextValue = {
  status: MeetingStatus;
  session: ActiveMeetingSession | null;
  /** Connect to a room and become the app-wide active meeting. */
  connect: (params: ConnectParams) => Promise<void>;
  /** Disconnect and tear down the active meeting (no navigation). */
  leave: () => void;
  /** Navigate back to the full-screen meeting route. */
  returnToRoom: () => void;
};

const ActiveMeetingContext = createContext<
  ActiveMeetingContextValue | undefined
>(undefined);

export function useActiveMeeting(): ActiveMeetingContextValue {
  const ctx = use(ActiveMeetingContext);
  if (!ctx) {
    throw new Error(
      "useActiveMeeting must be used within ActiveMeetingProvider",
    );
  }
  return ctx;
}

export function ActiveMeetingProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const locale = useLocale();

  const [room, setRoom] = useState<Room | null>(null);
  const [session, setSession] = useState<ActiveMeetingSession | null>(null);
  const [status, setStatus] = useState<MeetingStatus>("idle");
  const connectingRef = useRef(false);

  const teardown = useCallback(() => {
    setRoom((prev) => {
      prev?.disconnect().catch(() => {});
      return null;
    });
    setSession(null);
    setStatus("idle");
    // Clear in-meeting chat / hand-raise / sidebar state.
    useMeetingStore.getState().reset();
  }, []);

  const connect = useCallback(
    async (params: ConnectParams) => {
      if (connectingRef.current) {
        return;
      }
      connectingRef.current = true;
      setStatus("connecting");

      // Replace any existing session (e.g. joining a different room from PiP).
      room?.disconnect().catch(() => {});

      const prefs = useMeetingPreferencesStore.getState();
      const audioDeviceId =
        params.lobby.audioDeviceId || prefs.selectedAudioInputId || undefined;
      const videoDeviceId =
        params.lobby.videoDeviceId || prefs.selectedVideoInputId || undefined;
      const outputDeviceId =
        params.lobby.audioOutputDeviceId ||
        prefs.selectedAudioOutputId ||
        undefined;

      const next = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          deviceId: audioDeviceId,
          noiseSuppression: prefs.noiseSuppression,
        },
        videoCaptureDefaults: {
          deviceId: videoDeviceId,
        },
      });

      // Keep connection status reactive so the ConnectionOverlay / PiP reflect it.
      next
        .on(RoomEvent.ConnectionStateChanged, (state) => {
          if (state === ConnectionState.Connected) {
            setStatus("connected");
          } else if (state === ConnectionState.Reconnecting) {
            setStatus("reconnecting");
          } else if (state === ConnectionState.Connecting) {
            setStatus("connecting");
          }
        })
        .on(RoomEvent.Disconnected, () => {
          teardown();
        });

      try {
        await next.connect(params.serverUrl, params.token);
        await next.localParticipant.setMicrophoneEnabled(
          params.lobby.micEnabled,
        );
        await next.localParticipant.setCameraEnabled(params.lobby.camEnabled);
        if (outputDeviceId) {
          await next
            .switchActiveDevice("audiooutput", outputDeviceId)
            .catch(() => {});
        }

        // Apply saved layout / sidebar defaults for the fresh session.
        const meeting = useMeetingStore.getState();
        meeting.reset();
        if (prefs.defaultSidebarTab !== "none") {
          meeting.setSidebar(prefs.defaultSidebarTab);
        }
        if (prefs.defaultLayoutMode === "grid") {
          meeting.setForceGrid(true);
        }

        setRoom(next);
        setSession({
          roomId: params.roomId,
          roomMeta: params.roomMeta,
          mode: params.mode,
          isHost: params.isHost,
          guestId: params.guestId,
          displayName: params.lobby.displayName,
        });
        setStatus("connected");
      } catch (err) {
        next.disconnect().catch(() => {});
        setStatus("idle");
        toast.error(
          err instanceof Error
            ? err.message
            : "Failed to connect to the meeting",
        );
        throw err;
      } finally {
        connectingRef.current = false;
      }
    },
    [room, teardown],
  );

  const leave = useCallback(() => {
    teardown();
  }, [teardown]);

  const returnToRoom = useCallback(() => {
    if (!session) {
      return;
    }
    const path =
      session.mode === "webinar"
        ? ROUTES.WEBINAR_DETAIL(session.roomId)
        : ROUTES.MEETING_DETAIL(session.roomId);
    router.push(`/${locale}${path}`);
  }, [session, router, locale]);

  const value = useMemo<ActiveMeetingContextValue>(
    () => ({ status, session, connect, leave, returnToRoom }),
    [status, session, connect, leave, returnToRoom],
  );

  return (
    <ActiveMeetingContext value={value}>
      <RoomContext value={room ?? undefined}>
        {children}
        {room && (
          <>
            <RoomAudioRenderer />
            <PersistentRoomSignals />
            <FloatingMeetingOverlay />
          </>
        )}
      </RoomContext>
    </ActiveMeetingContext>
  );
}
