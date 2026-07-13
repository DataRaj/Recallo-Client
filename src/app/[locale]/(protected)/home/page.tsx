/**
 * Home page - Main dashboard after login
 * Displays meetings, webinars, transcripts, and quick actions
 */
"use client";

import {
  Video,
  Mic,
  FileText,
  Plus,
  ArrowRight,
  Zap,
  MessageSquare,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRecentRooms } from "@/hooks/use-recent-rooms";
import { useModal } from "@/components/providers/modal-provider";
import { ProtectedRoute } from "@/components/protected-route";
import { ROUTES } from "@/lib/routes";
import type { RecentRoom } from "@/utils/recent-rooms";
import Link from "next/link";

// Transcripts/summaries have no list endpoint yet — kept empty until one exists.
const RECENT_TRANSCRIPTS: unknown[] = [];
const AI_SUMMARIES: unknown[] = [];

function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

function DashboardSection({
  title,
  items,
  isEmpty,
  emptyMessage,
  icon: Icon,
  renderItem,
  viewAllLink,
}: {
  title: string;
  items: unknown[];
  isEmpty: boolean;
  emptyMessage: string;
  icon: React.ComponentType<{ size: number }>;
  renderItem?: (item: unknown) => React.ReactNode;
  viewAllLink?: string;
}) {
  return (
    <div
      className="rounded-[12px] overflow-hidden"
      style={{ background: "var(--color-chat-surface)" }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <div style={{ color: "var(--color-text-accent)" }}>
            <Icon size={20} />
          </div>
          <h3
            className="font-semibold"
            style={{ color: "var(--color-chat-text)" }}
          >
            {title}
          </h3>
        </div>
        {viewAllLink && items.length > 0 && (
          <Link
            href={viewAllLink}
            className="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-all"
            style={{ color: "var(--color-chat-accent)" }}
          >
            View All
            <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* Content */}
      <div
        className="divide-y"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        {isEmpty ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm" style={{ color: "rgba(251,245,221,0.4)" }}>
              {emptyMessage}
            </p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="px-6 py-4">
              {renderItem?.(item) ?? (
                <p style={{ color: "var(--color-chat-text)" }}>Item</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function QuickActionCard({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: React.ComponentType<{ size: number }>;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-[12px] text-left transition-all duration-200 border hover:border-opacity-50 active:scale-95"
      style={{
        borderColor: "rgba(255,255,255,0.06)",
        background: "var(--color-chat-bubble)",
      }}
    >
      <div
        style={{ color: "var(--color-text-accent)", marginBottom: "0.5rem" }}
      >
        <Icon size={24} />
      </div>
      <h4
        className="font-semibold mb-1 text-sm"
        style={{ color: "var(--color-chat-text)" }}
      >
        {label}
      </h4>
      <p className="text-xs" style={{ color: "rgba(251,245,221,0.5)" }}>
        {description}
      </p>
    </button>
  );
}

function RecentRoomRow({ room }: { room: RecentRoom }) {
  const href =
    room.type === "webinar"
      ? ROUTES.WEBINAR_DETAIL(room.id)
      : ROUTES.MEETING_DETAIL(room.id);
  return (
    <Link href={href} className="flex items-center justify-between gap-3 group">
      <div className="min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: "var(--color-chat-text)" }}
        >
          {room.title || `Room ${room.id}`}
        </p>
        <p className="text-xs" style={{ color: "rgba(251,245,221,0.4)" }}>
          {room.role === "host" ? "Hosted" : "Joined"} · {relativeTime(room.at)}
        </p>
      </div>
      <ArrowRight
        size={14}
        className="shrink-0 opacity-50 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"
        style={{ color: "var(--color-chat-accent)" }}
      />
    </Link>
  );
}

export default function HomePage() {
  const { user } = useCurrentUser();
  const { openModal } = useModal();
  const recentRooms = useRecentRooms();
  const recentMeetings = recentRooms.filter((r) => r.type === "meeting");
  const upcomingWebinars = recentRooms.filter((r) => r.type === "webinar");
  const userName = user?.name.split(" ")[0] || "User";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const openCreateRoom = () => openModal("create-room");
  const openJoinRoom = () => openModal("join-room");

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen p-8"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1
              className="text-4xl font-bold mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              {greeting}, {userName}! 👋
            </h1>
            <p style={{ color: "var(--color-text-secondary)" }}>
              Welcome back to Recallo
            </p>
          </div>

          {/* Quick Actions */}
          <div>
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickActionCard
                icon={Video}
                label="Create Room"
                description="Start an instant or scheduled meeting"
                onClick={openCreateRoom}
              />
              <QuickActionCard
                icon={Plus}
                label="Join Room"
                description="Enter a meeting with an invite link or ID"
                onClick={openJoinRoom}
              />
              <QuickActionCard
                icon={Mic}
                label="Start Webinar"
                description="Broadcast to a large audience"
                onClick={openCreateRoom}
              />
              <QuickActionCard
                icon={MessageSquare}
                label="View Chats"
                description="Continue your conversations"
                onClick={() => {
                  window.location.href = ROUTES.CHATS;
                }}
              />
            </div>
          </div>

          {/* Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Meetings */}
            <DashboardSection
              title="Recent Meetings"
              items={recentMeetings}
              isEmpty={recentMeetings.length === 0}
              emptyMessage="No recent meetings. Start or join one with the Quick Actions above!"
              icon={Video}
              viewAllLink={ROUTES.MEETINGS}
              renderItem={(item) => <RecentRoomRow room={item as RecentRoom} />}
            />

            {/* Upcoming Webinars */}
            <DashboardSection
              title="Recent Webinars"
              items={upcomingWebinars}
              isEmpty={upcomingWebinars.length === 0}
              emptyMessage="No webinars yet. Start one with the Quick Actions above!"
              icon={Mic}
              viewAllLink={ROUTES.WEBINARS}
              renderItem={(item) => <RecentRoomRow room={item as RecentRoom} />}
            />
          </div>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transcripts */}
            <DashboardSection
              title="Recent Transcripts"
              items={RECENT_TRANSCRIPTS}
              isEmpty={RECENT_TRANSCRIPTS.length === 0}
              emptyMessage="No transcripts available. They will appear here after your meetings."
              icon={FileText}
              viewAllLink={ROUTES.TRANSCRIPTS}
              renderItem={(item) => (
                <p style={{ color: "var(--color-chat-text)" }}>
                  {JSON.stringify(item)}
                </p>
              )}
            />

            {/* AI Summaries */}
            <DashboardSection
              title="AI Summaries"
              items={AI_SUMMARIES}
              isEmpty={AI_SUMMARIES.length === 0}
              emptyMessage="No AI summaries generated yet."
              icon={Zap}
              viewAllLink={ROUTES.SUMMARIES}
              renderItem={(item) => (
                <p style={{ color: "var(--color-chat-text)" }}>
                  {JSON.stringify(item)}
                </p>
              )}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
