'use client';

import type { MeetingHistoryItem } from '@/services/room-service';
import { AlertCircle, Calendar, CheckCircle2, Clock, Loader2, Radio, Users, Video } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ROUTES } from '@/lib/routes';
import { listRooms } from '@/services/room-service';
import { getMeetingIdentity } from '@/utils/identity';

type BadgeState = 'ready' | 'processing' | 'live';

function meetingState(m: MeetingHistoryItem): { key: BadgeState; label: string; className: string; Icon: typeof Radio } {
  if (m.status === 'live' || m.status === 'draft') {
    return {
      key: 'live',
      label: 'Live',
      className: 'border-[var(--color-text-accent)]/30 bg-[var(--color-text-accent)]/10 text-[var(--color-text-accent)]',
      Icon: Radio,
    };
  }
  if (m.has_summary) {
    return {
      key: 'ready',
      label: 'Insights ready',
      className: 'border-[var(--color-chat-accent)]/25 bg-[var(--color-chat-accent)]/10 text-[var(--color-chat-accent)]',
      Icon: CheckCircle2,
    };
  }
  return {
    key: 'processing',
    label: 'Processing',
    className: 'border-white/10 bg-white/5 text-white/60',
    Icon: Loader2,
  };
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const guestId = getMeetingIdentity();
    listRooms(guestId)
      .then((rooms) => {
        if (active) {
          setMeetings(rooms);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError('Failed to load your meetings. Please try again.');
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#141E1F] px-6 py-8 text-[var(--color-chat-text)] md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold">My Meetings</h1>
          <p className="mt-1 text-sm text-white/50">
            Browse past meetings and open their transcripts and AI summaries.
          </p>
        </header>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-8 animate-spin text-[var(--color-chat-accent)]" />
          </div>
        )}

        {!loading && error != null && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <AlertCircle className="size-8 text-[var(--color-text-accent)]" />
            <p className="text-sm text-white/60">{error}</p>
          </div>
        )}

        {!loading && error == null && meetings.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-[#1C2A2C] py-24 text-center">
            <Video className="size-8 text-white/30" />
            <p className="text-sm text-white/50">You haven't hosted any meetings yet.</p>
          </div>
        )}

        {!loading && error == null && meetings.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {meetings.map((m) => {
              const state = meetingState(m);
              const isLive = state.key === 'live';
              const href = isLive
                ? ROUTES.MEETING_DETAIL(m.livekit_room_name)
                : ROUTES.MEETING_INSIGHTS(m.livekit_room_name);
              return (
                <Link
                  key={m.id}
                  href={href}
                  className="group flex flex-col gap-4 rounded-2xl border border-white/5 bg-[#1C2A2C] p-5 transition-all hover:border-white/10 hover:bg-[#22312f]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="line-clamp-2 text-base font-semibold text-[var(--color-chat-text)]">
                      {m.title}
                    </h2>
                    <span
                      className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${state.className}`}
                    >
                      <state.Icon size={11} className={state.key === 'processing' ? 'animate-spin' : ''} />
                      {state.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/45">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-[var(--color-chat-accent)]" />
                      {new Date(m.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} className="text-[var(--color-chat-accent)]" />
                      {m.session_duration_mins ? `${m.session_duration_mins} min` : '—'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={12} className="text-[var(--color-chat-accent)]" />
                      {m.participant_count}
                    </span>
                  </div>

                  {!isLive && (
                    <div className="mt-auto flex items-center gap-3 border-t border-white/5 pt-3 text-xs">
                      {m.has_summary
                        ? (
                            <span className="font-semibold text-[var(--color-chat-accent)] group-hover:underline">
                              View insights →
                            </span>
                          )
                        : (
                            <span className="text-white/40">Generating insights…</span>
                          )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
