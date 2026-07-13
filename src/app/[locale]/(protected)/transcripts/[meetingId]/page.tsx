'use client';

import type { TranscriptData, Utterance, Word } from '@/services/transcript-service';
import type { Room } from '@/types/room';
import {
  ArrowLeft,
  Brain,
  Calendar,
  Clock,
  Download,
  MessageSquareQuote,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useCallback, useEffect, useState } from 'react';
import { ROUTES } from '@/lib/routes';
import { getRoom } from '@/services/room-service';
import { getRoomTranscript, groupWordsIntoUtterances } from '@/services/transcript-service';

type PageProps = {
  params: Promise<{
    meetingId: string;
    locale: string;
  }>;
};

const SPEAKER_PALETTE = [
  '#9CC5A1',
  '#BA5A5A',
  '#7EB3C9',
  '#C9A87E',
  '#B07EC9',
  '#C9C07E',
];

function speakerColor(index: number): string {
  return SPEAKER_PALETTE[index % SPEAKER_PALETTE.length] ?? '#9CC5A1';
}

export default function TranscriptDetailPage({ params }: PageProps) {
  const { meetingId } = use(params);
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [utterances, setUtterances] = useState<Utterance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredWord, setHoveredWord] = useState<Word | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, t] = await Promise.allSettled([
        getRoom(meetingId),
        getRoomTranscript(meetingId),
      ]);
      if (r.status === 'fulfilled') {
        setRoom(r.value);
      }
      if (t.status === 'fulfilled') {
        setTranscript(t.value);
        setUtterances(groupWordsIntoUtterances(t.value.words_json ?? []));
      } else {
        setError('processing');
      }
    } catch {
      setError('processing');
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownload = () => {
    if (!transcript) {
      return;
    }
    const textContent = utterances
      .map((ut) => {
        const ts = new Date(ut.start * 1000).toISOString().substr(14, 5);
        return `[${ts}] Speaker ${ut.speaker}: ${ut.text}`;
      })
      .join('\n\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${room?.title ?? 'meeting'}-${meetingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (s: number) =>
    new Date(s * 1000).toISOString().substr(14, 5);

  const filteredUtterances = searchTerm.trim()
    ? utterances.filter(ut =>
        ut.text.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : utterances;

  return (
    <div className="min-h-screen bg-[#141E1F] pb-16 font-sans text-[#FBF5DD]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#1C2A2C] px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(ROUTES.HOME)}
            className="rounded-lg p-2 text-[#D9D3BC] transition-all hover:bg-white/5 hover:text-[#FBF5DD]"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2.5">
            <MessageSquareQuote className="size-5 text-[#9CC5A1]" />
            <h1 className="text-md font-semibold text-[#FBF5DD]">Audio Transcript</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={!transcript}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-[#D9D3BC] transition-all hover:bg-white/5 hover:text-[#FBF5DD] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download size={14} />
            Export TXT
          </button>

          <Link
            href={ROUTES.SUMMARY_DETAIL(meetingId)}
            className="hover:bg-opacity-95 flex items-center gap-2 rounded-xl bg-[#9CC5A1] px-3.5 py-1.5 text-xs font-semibold text-[#141E1F] transition-all"
          >
            <Brain size={14} />
            AI Summary
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-6 pt-8">
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/5 bg-[#1C2A2C] p-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold text-[#FBF5DD]">
              {room?.title ?? meetingId}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-white/50">
              {transcript && (
                <>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#9CC5A1]" />
                    {new Date(transcript.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-[#9CC5A1]" />
                    {transcript.duration_sec}
                    s processed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#9CC5A1]" />
                    {(transcript.confidence * 100).toFixed(1)}
                    % word confidence
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#D9D3BC]/60" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search transcript..."
              className="w-full rounded-xl border border-white/5 bg-[#273338] py-2 pr-4 pl-9 text-xs text-[#FBF5DD] placeholder-[#D9D3BC]/40 focus:ring-1 focus:ring-[#9CC5A1] focus:outline-none"
            />
          </div>
        </div>

        {hoveredWord && (
          <div className="fixed right-6 bottom-6 z-40 max-w-xs space-y-2 rounded-xl border border-white/10 bg-[#273338] p-4 text-xs shadow-2xl transition-all duration-300">
            <p className="flex items-center gap-1 font-semibold text-[#9CC5A1]">
              <Sparkles size={12} />
              Deepgram Word Details
            </p>
            <div className="space-y-1 text-white/70">
              <p>
                Word:
                <span className="font-medium text-white">
                  &quot;
                  {hoveredWord.word.replace(/[.,?/]/g, '')}
                  &quot;
                </span>
              </p>
              <p>
                Timing:
                <span className="text-white">
                  {hoveredWord.start.toFixed(2)}
                  s –
                  {' '}
                  {hoveredWord.end.toFixed(2)}
                  s
                </span>
              </p>
              <p>
                Confidence:
                <span className="text-white">
                  {(hoveredWord.confidence * 100).toFixed(2)}
                  %
                </span>
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-white/40">
            <div className="size-10 animate-spin rounded-full border-2 border-[#9CC5A1]/20 border-t-[#9CC5A1]" />
            <p className="text-sm">Loading transcript…</p>
          </div>
        )}

        {!loading && error === 'processing' && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/5 bg-[#1C2A2C] p-10 text-center">
            <div className="relative flex size-16 items-center justify-center">
              <div className="absolute inset-0 animate-pulse rounded-full border-2 border-[#9CC5A1]/10" />
              <div className="absolute inset-1 animate-spin rounded-full border-2 border-[#9CC5A1]/20 border-t-[#9CC5A1]" />
              <MessageSquareQuote className="size-6 text-[#9CC5A1]" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-[#FBF5DD]">Transcript is being generated by AI</p>
              <p className="text-xs text-white/40">Please refresh in a few moments while Deepgram processes the audio.</p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-[#D9D3BC] transition-all hover:bg-white/5"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {filteredUtterances.map((ut, index) => {
              const color = speakerColor(ut.speaker);
              return (
                <div
                  key={index}
                  className="flex gap-4 rounded-2xl border border-white/5 bg-[#1C2A2C] p-4 transition-all hover:bg-[#1E2E30]/60"
                >
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: color }}
                  >
                    {ut.speaker}
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-xs font-bold" style={{ color }}>
                        Speaker
                        {' '}
                        {ut.speaker}
                      </h3>
                      <span className="flex items-center gap-1 font-mono text-[10px] text-white/35">
                        <Clock size={10} />
                        {formatTimestamp(ut.start)}
                      </span>
                    </div>

                    <p className="flex flex-wrap gap-x-1 gap-y-1.5 text-sm leading-relaxed text-white/80 select-text">
                      {ut.words.map((w, wIdx) => (
                        <span
                          key={wIdx}
                          onMouseEnter={() => setHoveredWord(w)}
                          onMouseLeave={() => setHoveredWord(null)}
                          className="cursor-help decoration-[#9CC5A1]/40 underline-offset-4 transition-colors duration-100 hover:text-[#9CC5A1] hover:underline"
                          style={{ opacity: w.confidence < 0.90 ? 0.7 : 1 }}
                        >
                          {w.word}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              );
            })}

            {filteredUtterances.length === 0 && searchTerm && (
              <div className="space-y-2 py-16 text-center text-white/30">
                <MessageSquareQuote className="mx-auto size-12 opacity-30" />
                <p className="text-sm font-medium">No matches found in transcript</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
