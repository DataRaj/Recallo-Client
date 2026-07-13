'use client';

import type { SummaryData } from '@/services/summary-service';
import type { Room } from '@/types/room';
import {
  AlertCircle,
  ArrowLeft,
  Brain,
  Calendar,
  Clock,
  Flag,
  ListTodo,
  Loader2,
  Sparkles,
  Tag,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { ROUTES } from '@/lib/routes';
import { getRoom } from '@/services/room-service';
import { getRoomSummary } from '@/services/summary-service';

type PageProps = {
  params: Promise<{
    meetingId: string;
    locale: string;
  }>;
};

export default function SummaryDetailPage({ params }: PageProps) {
  const { meetingId } = use(params);
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const r = await getRoom(meetingId);
        if (active) {
          setRoom(r);
        }
      } catch {
        // room details are non-critical
      }

      try {
        const data = await getRoomSummary(meetingId);
        if (active) {
          setSummary(data);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!active) {
          return;
        }
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          setProcessing(true);
          setLoading(false);
        } else {
          setError('Failed to load summary. Please try again.');
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [meetingId]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#141E1F] px-4 text-[var(--color-chat-text)]">
        <div className="relative mb-8 flex size-24 items-center justify-center">
          <div className="absolute inset-0 animate-pulse rounded-full border-4 border-[var(--color-chat-accent)]/10" />
          <div className="absolute inset-2 animate-spin rounded-full border-4 border-[var(--color-chat-accent)]/20 border-t-[var(--color-chat-accent)]" />
          <Brain className="size-8 animate-bounce text-[var(--color-chat-accent)]" />
        </div>
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Sparkles className="size-5 animate-pulse text-[var(--color-chat-accent)]" />
          Loading insights...
        </h2>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#141E1F] px-4 text-center text-[var(--color-chat-text)]">
        <Loader2 className="mb-6 size-10 animate-spin text-[var(--color-chat-accent)]" />
        <h2 className="mb-2 text-xl font-bold">AI is synthesizing meeting insights...</h2>
        <p className="max-w-sm text-sm text-white/50">
          Grok is analyzing the transcript and generating your summary. This usually takes under a minute.
          Refresh the page in a moment to see your results.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-[var(--color-chat-text-2)] transition-all hover:bg-white/5"
        >
          Refresh
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#141E1F] px-4 text-center text-[var(--color-chat-text)]">
        <AlertCircle className="mb-4 size-10 text-[var(--color-text-accent)]" />
        <p className="text-sm text-white/60">{error}</p>
        <button
          onClick={() => router.push(ROUTES.HOME)}
          className="mt-6 rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-[var(--color-chat-text-2)] transition-all hover:bg-white/5"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141E1F] pb-16 font-sans text-[var(--color-chat-text)]">
      {/* Navbar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#1C2A2C] px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(ROUTES.HOME)}
            className="rounded-lg p-2 text-[var(--color-chat-text-2)] transition-all hover:bg-white/5 hover:text-[var(--color-chat-text)]"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2.5">
            <Brain className="size-5 text-[var(--color-chat-accent)]" />
            <h1 className="text-md font-semibold text-[var(--color-chat-text)]">AI Meeting Insights</h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="rounded-full border border-[var(--color-chat-accent)]/20 bg-[var(--color-chat-accent)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-chat-accent)] capitalize">
            {summary?.category || 'meeting'}
          </span>
          <span className="text-[10px] text-white/40">
            Powered by
            {' '}
            {summary?.model}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl space-y-6 px-6 pt-8">
        {/* Title Section */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/5 bg-[#1C2A2C] p-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-chat-text)]">
              {room?.title || meetingId}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-white/50">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[var(--color-chat-accent)]" />
                {summary ? new Date(summary.created_at).toLocaleDateString() : '—'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-[var(--color-chat-accent)]" />
                {room?.session_duration_mins ? `${room.session_duration_mins} mins` : '—'}
              </span>
              <span className="flex items-center gap-1.5">
                <User size={13} className="text-[var(--color-chat-accent)]" />
                {room ? `${room.participantCount} attendees` : '—'}
              </span>
            </div>
          </div>

          <Link
            href={ROUTES.TRANSCRIPT_DETAIL(meetingId)}
            className="self-start rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-[var(--color-chat-text-2)] transition-all hover:bg-white/5 hover:text-[var(--color-chat-text)] md:self-auto"
          >
            View Full Transcript
          </Link>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column (2 cols width): Summary & Key Points */}
          <div className="space-y-6 lg:col-span-2">
            {/* Executive Summary */}
            <div className="rounded-2xl border border-white/5 bg-[#1C2A2C] p-6">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wider text-[var(--color-chat-accent)] uppercase">
                <Brain size={16} />
                Executive Summary
              </h3>
              <p className="text-sm leading-relaxed font-normal text-white/80">
                {summary?.executive_summary}
              </p>
            </div>

            {/* Key Points */}
            <div className="rounded-2xl border border-white/5 bg-[#1C2A2C] p-6">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wider text-[var(--color-chat-accent)] uppercase">
                <Sparkles size={16} />
                Key Discussion Points
              </h3>
              <ul className="space-y-3">
                {summary?.key_points.map((point, index) => (
                  <li key={index} className="flex gap-3 text-sm leading-relaxed text-white/80">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--color-chat-accent)]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Decisions Made */}
            <div className="rounded-2xl border border-white/5 bg-[#1C2A2C] p-6">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wider text-[var(--color-text-accent)] uppercase">
                <Flag size={16} />
                Decisions Made
              </h3>
              <ul className="space-y-3">
                {summary?.decisions_made.map((decision, index) => (
                  <li key={index} className="flex gap-3 text-sm leading-relaxed text-white/80">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--color-text-accent)]" />
                    <span>{decision}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column (1 col width): Action Items & Tags */}
          <div className="space-y-6">
            {/* Action Items */}
            <div className="rounded-2xl border border-white/5 bg-[#1C2A2C] p-6">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wider text-[var(--color-chat-accent)] uppercase">
                <ListTodo size={16} />
                Action Items
              </h3>
              <div className="space-y-4">
                {summary?.action_items.map((item, index) => (
                  <div
                    key={index}
                    className="space-y-2.5 rounded-xl border border-white/5 bg-[var(--color-chat-bg)] p-3.5 transition-all hover:border-white/10"
                  >
                    <div className="flex gap-2">
                      <input
                        type="checkbox"
                        id={`todo-${index}`}
                        className="mt-1 cursor-pointer rounded border-white/10 text-[var(--color-chat-accent)] focus:ring-0 focus:ring-offset-0"
                      />
                      <label
                        htmlFor={`todo-${index}`}
                        className="cursor-pointer text-xs leading-snug font-medium text-white/85"
                      >
                        {item.task}
                      </label>
                    </div>

                    <div className="flex items-center justify-between pl-6 text-[10px] text-white/40">
                      <span className="flex items-center gap-1">
                        <User size={10} className="text-[var(--color-chat-accent)]" />
                        {item.assignee}
                      </span>
                      <span className="rounded border border-white/5 bg-white/5 px-2 py-0.5 font-medium">
                        {item.deadline}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discussion Tags */}
            <div className="rounded-2xl border border-white/5 bg-[#1C2A2C] p-6">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wider text-[var(--color-chat-accent)] uppercase">
                <Tag size={16} />
                Discussion Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {summary?.discussion_tags.map(tag => (
                  <span
                    key={tag}
                    className="cursor-default rounded-lg border border-white/5 bg-[var(--color-chat-bg)] px-2.5 py-1 text-xs font-medium text-[var(--color-chat-text-2)] transition-all hover:bg-[var(--color-chat-surface)] hover:text-[var(--color-chat-text)]"
                  >
                    #
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
