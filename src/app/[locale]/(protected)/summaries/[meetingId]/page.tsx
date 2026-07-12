'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Brain,
  Sparkles,
  Flag,
  Tag,
  Calendar,
  Clock,
  User,
  ListTodo,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { getRoom } from '@/services/room-service';
import { getRoomSummary } from '@/services/summary-service';
import type { SummaryData } from '@/services/summary-service';
import type { Room } from '@/types/room';

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
        if (active) setRoom(r);
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
        if (!active) return;
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
    return () => { active = false; };
  }, [meetingId]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#141E1F] text-[#FBF5DD] px-4">
        <div className="relative flex items-center justify-center w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-[#9CC5A1]/10 animate-pulse" />
          <div className="absolute inset-2 rounded-full border-4 border-[#9CC5A1]/20 animate-spin border-t-[#9CC5A1]" />
          <Brain className="w-8 h-8 text-[#9CC5A1] animate-bounce" />
        </div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#9CC5A1] animate-pulse" />
          Loading insights...
        </h2>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#141E1F] text-[#FBF5DD] px-4 text-center">
        <Loader2 className="w-10 h-10 text-[#9CC5A1] animate-spin mb-6" />
        <h2 className="text-xl font-bold mb-2">AI is synthesizing meeting insights...</h2>
        <p className="text-sm text-white/50 max-w-sm">
          Grok is analyzing the transcript and generating your summary. This usually takes under a minute.
          Refresh the page in a moment to see your results.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold hover:bg-white/5 transition-all text-[#D9D3BC]"
        >
          Refresh
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#141E1F] text-[#FBF5DD] px-4 text-center">
        <AlertCircle className="w-10 h-10 text-[#BA5A5A] mb-4" />
        <p className="text-white/60 text-sm">{error}</p>
        <button
          onClick={() => router.push(ROUTES.HOME)}
          className="mt-6 px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold hover:bg-white/5 transition-all text-[#D9D3BC]"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141E1F] text-[#FBF5DD] pb-16 font-sans">
      {/* Navbar */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#1C2A2C] sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(ROUTES.HOME)}
            className="p-2 hover:bg-white/5 rounded-lg transition-all text-[#D9D3BC] hover:text-[#FBF5DD]"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2.5">
            <Brain className="w-5 h-5 text-[#9CC5A1]" />
            <h1 className="text-md font-semibold text-[#FBF5DD]">AI Meeting Insights</h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#9CC5A1]/10 text-[#9CC5A1] border border-[#9CC5A1]/20 font-medium capitalize">
            {summary?.category || 'meeting'}
          </span>
          <span className="text-[10px] text-white/40">
            Powered by {summary?.model}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 pt-8 space-y-6">
        {/* Title Section */}
        <div className="rounded-2xl p-6 bg-[#1C2A2C] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#FBF5DD]">
              {room?.title || meetingId}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-white/50">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#9CC5A1]" />
                {summary ? new Date(summary.created_at).toLocaleDateString() : '—'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-[#9CC5A1]" />
                {room?.session_duration_mins ? `${room.session_duration_mins} mins` : '—'}
              </span>
              <span className="flex items-center gap-1.5">
                <User size={13} className="text-[#9CC5A1]" />
                {room ? `${room.participantCount} attendees` : '—'}
              </span>
            </div>
          </div>

          <Link
            href={ROUTES.TRANSCRIPT_DETAIL(meetingId)}
            className="self-start md:self-auto px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold hover:bg-white/5 transition-all text-[#D9D3BC] hover:text-[#FBF5DD]"
          >
            View Full Transcript
          </Link>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols width): Summary & Key Points */}
          <div className="lg:col-span-2 space-y-6">
            {/* Executive Summary */}
            <div className="rounded-2xl p-6 bg-[#1C2A2C] border border-white/5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#9CC5A1] mb-3 flex items-center gap-2">
                <Brain size={16} />
                Executive Summary
              </h3>
              <p className="text-sm text-white/80 leading-relaxed font-normal">
                {summary?.executive_summary}
              </p>
            </div>

            {/* Key Points */}
            <div className="rounded-2xl p-6 bg-[#1C2A2C] border border-white/5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#9CC5A1] mb-4 flex items-center gap-2">
                <Sparkles size={16} />
                Key Discussion Points
              </h3>
              <ul className="space-y-3">
                {summary?.key_points.map((point, index) => (
                  <li key={index} className="flex gap-3 text-sm text-white/80 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9CC5A1] mt-2 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Decisions Made */}
            <div className="rounded-2xl p-6 bg-[#1C2A2C] border border-white/5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#BA5A5A] mb-4 flex items-center gap-2">
                <Flag size={16} />
                Decisions Made
              </h3>
              <ul className="space-y-3">
                {summary?.decisions_made.map((decision, index) => (
                  <li key={index} className="flex gap-3 text-sm text-white/80 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#BA5A5A] mt-2 shrink-0" />
                    <span>{decision}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column (1 col width): Action Items & Tags */}
          <div className="space-y-6">
            {/* Action Items */}
            <div className="rounded-2xl p-6 bg-[#1C2A2C] border border-white/5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#9CC5A1] mb-4 flex items-center gap-2">
                <ListTodo size={16} />
                Action Items
              </h3>
              <div className="space-y-4">
                {summary?.action_items.map((item, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-[#273338] border border-white/5 space-y-2.5 transition-all hover:border-white/10"
                  >
                    <div className="flex gap-2">
                      <input
                        type="checkbox"
                        id={`todo-${index}`}
                        className="mt-1 rounded border-white/10 text-[#9CC5A1] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <label
                        htmlFor={`todo-${index}`}
                        className="text-xs text-white/85 leading-snug font-medium cursor-pointer"
                      >
                        {item.task}
                      </label>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-white/40 pl-6">
                      <span className="flex items-center gap-1">
                        <User size={10} className="text-[#9CC5A1]" />
                        {item.assignee}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/5 font-medium border border-white/5">
                        {item.deadline}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discussion Tags */}
            <div className="rounded-2xl p-6 bg-[#1C2A2C] border border-white/5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#9CC5A1] mb-3 flex items-center gap-2">
                <Tag size={16} />
                Discussion Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {summary?.discussion_tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-xs rounded-lg bg-[#273338] text-[#D9D3BC] border border-white/5 font-medium transition-all hover:bg-[#324147] hover:text-[#FBF5DD] cursor-default"
                  >
                    #{tag}
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
