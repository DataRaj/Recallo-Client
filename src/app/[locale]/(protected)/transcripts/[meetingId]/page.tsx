'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  Clock,
  Download,
  Brain,
  Search,
  MessageSquareQuote,
  RefreshCw,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { getRoom } from '@/services/room-service';
import { getRoomTranscript, groupWordsIntoUtterances } from '@/services/transcript-service';
import type { Room } from '@/types/room';
import type { TranscriptData, Utterance, Word } from '@/services/transcript-service';

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
      if (r.status === 'fulfilled') setRoom(r.value);
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

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDownload = () => {
    if (!transcript) return;
    const textContent = utterances
      .map(ut => {
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
        ut.text.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : utterances;

  return (
    <div className="min-h-screen bg-[#141E1F] text-[#FBF5DD] pb-16 font-sans">
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#1C2A2C] sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(ROUTES.HOME)}
            className="p-2 hover:bg-white/5 rounded-lg transition-all text-[#D9D3BC] hover:text-[#FBF5DD]"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2.5">
            <MessageSquareQuote className="w-5 h-5 text-[#9CC5A1]" />
            <h1 className="text-md font-semibold text-[#FBF5DD]">Audio Transcript</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={!transcript}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-semibold hover:bg-white/5 transition-all text-[#D9D3BC] hover:text-[#FBF5DD] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            Export TXT
          </button>

          <Link
            href={ROUTES.SUMMARY_DETAIL(meetingId)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#9CC5A1] text-[#141E1F] text-xs font-semibold hover:bg-opacity-95 transition-all"
          >
            <Brain size={14} />
            AI Summary
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-8 space-y-6">
        <div className="rounded-2xl p-6 bg-[#1C2A2C] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#FBF5DD]">
              {room?.title ?? meetingId}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-white/50">
              {transcript && (
                <>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#9CC5A1]" />
                    {new Date(transcript.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-[#9CC5A1]" />
                    {transcript.duration_sec}s processed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#9CC5A1]" />
                    {(transcript.confidence * 100).toFixed(1)}% word confidence
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D9D3BC]/60 w-3.5 h-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search transcript..."
              className="w-full bg-[#273338] text-[#FBF5DD] placeholder-[#D9D3BC]/40 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#9CC5A1] text-xs border border-white/5"
            />
          </div>
        </div>

        {hoveredWord && (
          <div className="fixed bottom-6 right-6 bg-[#273338] border border-white/10 p-4 rounded-xl shadow-2xl z-40 max-w-xs space-y-2 text-xs transition-all duration-300">
            <p className="font-semibold text-[#9CC5A1] flex items-center gap-1">
              <Sparkles size={12} />
              Deepgram Word Details
            </p>
            <div className="space-y-1 text-white/70">
              <p>Word: <span className="text-white font-medium">&quot;{hoveredWord.word.replace(/[.,?/]/g, '')}&quot;</span></p>
              <p>Timing: <span className="text-white">{hoveredWord.start.toFixed(2)}s – {hoveredWord.end.toFixed(2)}s</span></p>
              <p>Confidence: <span className="text-white">{(hoveredWord.confidence * 100).toFixed(2)}%</span></p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-white/40">
            <div className="w-10 h-10 rounded-full border-2 border-[#9CC5A1]/20 border-t-[#9CC5A1] animate-spin" />
            <p className="text-sm">Loading transcript…</p>
          </div>
        )}

        {!loading && error === 'processing' && (
          <div className="rounded-2xl p-10 bg-[#1C2A2C] border border-white/5 flex flex-col items-center gap-4 text-center">
            <div className="relative flex items-center justify-center w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-[#9CC5A1]/10 animate-pulse" />
              <div className="absolute inset-1 rounded-full border-2 border-[#9CC5A1]/20 animate-spin border-t-[#9CC5A1]" />
              <MessageSquareQuote className="w-6 h-6 text-[#9CC5A1]" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-[#FBF5DD]">Transcript is being generated by AI</p>
              <p className="text-xs text-white/40">Please refresh in a few moments while Deepgram processes the audio.</p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold hover:bg-white/5 transition-all text-[#D9D3BC]"
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
                  className="flex gap-4 p-4 rounded-2xl bg-[#1C2A2C] border border-white/5 transition-all hover:bg-[#1E2E30]/60"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: color }}
                  >
                    {ut.speaker}
                  </div>

                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold" style={{ color }}>
                        Speaker {ut.speaker}
                      </h3>
                      <span className="text-[10px] text-white/35 flex items-center gap-1 font-mono">
                        <Clock size={10} />
                        {formatTimestamp(ut.start)}
                      </span>
                    </div>

                    <p className="text-sm leading-relaxed text-white/80 select-text flex flex-wrap gap-x-1 gap-y-1.5">
                      {ut.words.map((w, wIdx) => (
                        <span
                          key={wIdx}
                          onMouseEnter={() => setHoveredWord(w)}
                          onMouseLeave={() => setHoveredWord(null)}
                          className="cursor-help hover:text-[#9CC5A1] hover:underline decoration-[#9CC5A1]/40 underline-offset-4 transition-colors duration-100"
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
              <div className="text-center py-16 text-white/30 space-y-2">
                <MessageSquareQuote className="w-12 h-12 mx-auto opacity-30" />
                <p className="text-sm font-medium">No matches found in transcript</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
