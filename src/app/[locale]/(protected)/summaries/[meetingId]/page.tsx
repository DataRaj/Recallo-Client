'use client';

import type { SummaryData } from '@/services/summary-service';
import type { Room } from '@/types/room';
import { AlertCircle, ArrowLeft, Brain, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { SummaryView } from '@/components/insights/summary-view';
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
        {summary && (
          <SummaryView
            summary={summary}
            title={room?.title || meetingId}
            durationMins={room?.session_duration_mins}
            participantCount={room?.participantCount}
            transcriptHref={ROUTES.TRANSCRIPT_DETAIL(meetingId)}
          />
        )}
      </main>
    </div>
  );
}
