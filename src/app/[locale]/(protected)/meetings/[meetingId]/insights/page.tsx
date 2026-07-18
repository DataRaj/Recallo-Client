'use client';

import type { InsightsData } from '@/services/insights-service';
import type { Room } from '@/types/room';
import { AlertCircle, ArrowLeft, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useRef, useState } from 'react';
import { PipelineProgress } from '@/components/insights/pipeline-progress';
import { SummaryView } from '@/components/insights/summary-view';
import { TranscriptView } from '@/components/insights/transcript-view';
import { ROUTES } from '@/lib/routes';
import { getRoomInsights } from '@/services/insights-service';
import { getRoom } from '@/services/room-service';

type PageProps = {
  params: Promise<{ meetingId: string; locale: string }>;
};

const POLL_INTERVAL_MS = 4000;

export default function MeetingInsightsPage({ params }: PageProps) {
  const { meetingId } = use(params);
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch room details once (title / duration / attendees) — non-critical.
  useEffect(() => {
    let active = true;
    getRoom(meetingId)
      .then(r => active && setRoom(r))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [meetingId]);

  // Poll the insights pipeline until it completes (or fails).
  useEffect(() => {
    let active = true;

    const poll = async () => {
      try {
        const data = await getRoomInsights(meetingId);
        if (!active) {
          return;
        }
        setInsights(data);
        setError(null);
        if (data.status === 'completed' || data.status === 'failed') {
          return; // stop polling
        }
      } catch (err: unknown) {
        if (!active) {
          return;
        }
        const status = (err as { response?: { status?: number } })?.response?.status;
        // 404 = unknown room; anything else is transient — keep polling.
        if (status === 404) {
          setError('This meeting could not be found.');
          return;
        }
      }
      if (active) {
        timerRef.current = setTimeout(() => void poll(), POLL_INTERVAL_MS);
      }
    };

    void poll();
    return () => {
      active = false;
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [meetingId]);

  const goHome = () => router.push(ROUTES.HOME);

  if (error != null) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#141E1F] px-4 text-center text-[var(--color-chat-text)]">
        <AlertCircle className="mb-4 size-10 text-[var(--color-text-accent)]" />
        <p className="text-sm text-white/60">{error}</p>
        <button
          onClick={goHome}
          className="mt-6 rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-[var(--color-chat-text-2)] transition-all hover:bg-white/5"
        >
          Go Home
        </button>
      </div>
    );
  }

  const completed = insights?.status === 'completed';
  const failed = insights?.status === 'failed';

  return (
    <div className="min-h-screen bg-[#141E1F] pb-16 font-sans text-[var(--color-chat-text)]">
      {/* Navbar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#1C2A2C] px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(ROUTES.MEETINGS)}
            className="rounded-lg p-2 text-[var(--color-chat-text-2)] transition-all hover:bg-white/5 hover:text-[var(--color-chat-text)]"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2.5">
            <Brain className="size-5 text-[var(--color-chat-accent)]" />
            <h1 className="text-md font-semibold text-[var(--color-chat-text)]">AI Meeting Insights</h1>
          </div>
        </div>

        {insights?.summary && (
          <div className="flex items-center gap-2.5">
            <span className="rounded-full border border-[var(--color-chat-accent)]/20 bg-[var(--color-chat-accent)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-chat-accent)] capitalize">
              {insights.summary.category || 'meeting'}
            </span>
            <span className="text-[10px] text-white/40">
              Powered by
              {' '}
              {insights.summary.model}
            </span>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 pt-8">
        {!completed && !failed && (
          <div className="pt-10">
            <PipelineProgress step={insights?.step ?? 'finalizing'} message={insights?.message} />
          </div>
        )}

        {failed && (
          <div className="mx-auto max-w-lg rounded-2xl border border-[var(--color-text-accent)]/20 bg-[#1C2A2C] p-8 text-center">
            <AlertCircle className="mx-auto mb-4 size-8 text-[var(--color-text-accent)]" />
            <h2 className="mb-2 text-lg font-bold">We couldn't process this meeting</h2>
            <p className="text-sm text-white/50">
              {insights?.message != null && insights.message !== ''
                ? insights.message
                : 'Something went wrong while generating insights for this recording.'}
            </p>
          </div>
        )}

        {completed && insights?.summary && (
          <>
            <SummaryView
              summary={insights.summary}
              title={room?.title != null && room.title !== '' ? room.title : meetingId}
              durationMins={room?.session_duration_mins}
              participantCount={room?.participantCount}
            />
            {insights.transcript && <TranscriptView transcript={insights.transcript} />}
          </>
        )}
      </main>
    </div>
  );
}
