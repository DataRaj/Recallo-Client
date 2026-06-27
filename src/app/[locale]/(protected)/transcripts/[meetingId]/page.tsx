'use client';

import { use, useState, useEffect } from 'react';
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
  MessageSquareQuote
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { getRoom } from '@/services/room-service';
import type { Room } from '@/types/room';

type PageProps = {
  params: Promise<{
    meetingId: string;
    locale: string;
  }>;
};

interface Word {
  word: string;
  start: number;
  end: number;
  confidence: number;
  speaker: number;
}

interface Utterance {
  speaker: number;
  start: number;
  end: number;
  text: string;
  words: Word[];
}

interface TranscriptData {
  text: string;
  confidence: number;
  duration_sec: number;
  utterances: Utterance[];
}

const MOCK_TRANSCRIPT: TranscriptData = {
  text: "Hey team, how's the new feature coming along? Making good progress. Should have a PR ready by EOD. Awesome, let me know if you need any review.",
  confidence: 0.9854,
  duration_sec: 15,
  utterances: [
    {
      speaker: 0,
      start: 0.12,
      end: 2.50,
      text: "Hey team, how's the new feature coming along?",
      words: [
        { word: "Hey", start: 0.12, end: 0.40, confidence: 0.99, speaker: 0 },
        { word: "team,", start: 0.42, end: 0.70, confidence: 0.99, speaker: 0 },
        { word: "how's", start: 0.72, end: 1.00, confidence: 0.98, speaker: 0 },
        { word: "the", start: 1.02, end: 1.20, confidence: 0.99, speaker: 0 },
        { word: "new", start: 1.22, end: 1.50, confidence: 0.99, speaker: 0 },
        { word: "feature", start: 1.52, end: 1.90, confidence: 0.99, speaker: 0 },
        { word: "coming", start: 1.92, end: 2.20, confidence: 0.99, speaker: 0 },
        { word: "along?", start: 2.22, end: 2.50, confidence: 0.97, speaker: 0 }
      ]
    },
    {
      speaker: 1,
      start: 3.10,
      end: 6.20,
      text: "Making good progress. Should have a PR ready by EOD.",
      words: [
        { word: "Making", start: 3.10, end: 3.50, confidence: 0.99, speaker: 1 },
        { word: "good", start: 3.52, end: 3.80, confidence: 0.99, speaker: 1 },
        { word: "progress.", start: 3.82, end: 4.20, confidence: 0.99, speaker: 1 },
        { word: "Should", start: 4.40, end: 4.70, confidence: 0.98, speaker: 1 },
        { word: "have", start: 4.72, end: 4.90, confidence: 0.99, speaker: 1 },
        { word: "a", start: 4.92, end: 5.00, confidence: 0.99, speaker: 1 },
        { word: "PR", start: 5.02, end: 5.40, confidence: 0.96, speaker: 1 },
        { word: "ready", start: 5.42, end: 5.70, confidence: 0.99, speaker: 1 },
        { word: "by", start: 5.72, end: 5.90, confidence: 0.99, speaker: 1 },
        { word: "EOD.", start: 5.92, end: 6.20, confidence: 0.97, speaker: 1 }
      ]
    },
    {
      speaker: 0,
      start: 6.80,
      end: 9.30,
      text: "Awesome, let me know if you need any review.",
      words: [
        { word: "Awesome,", start: 6.80, end: 7.30, confidence: 0.99, speaker: 0 },
        { word: "let", start: 7.42, end: 7.60, confidence: 0.99, speaker: 0 },
        { word: "me", start: 7.62, end: 7.80, confidence: 0.99, speaker: 0 },
        { word: "know", start: 7.82, end: 8.00, confidence: 0.99, speaker: 0 },
        { word: "if", start: 8.02, end: 8.20, confidence: 0.99, speaker: 0 },
        { word: "you", start: 8.22, end: 8.40, confidence: 0.99, speaker: 0 },
        { word: "need", start: 8.42, end: 8.70, confidence: 0.99, speaker: 0 },
        { word: "any", start: 8.72, end: 8.90, confidence: 0.99, speaker: 0 },
        { word: "review.", start: 8.92, end: 9.30, confidence: 0.98, speaker: 0 }
      ]
    }
  ]
};

const SPEAKER_NAMES: Record<number, { name: string; color: string }> = {
  0: { name: "Alex K.", color: "#BA5A5A" },
  1: { name: "You (Sarah)", color: "#9CC5A1" },
  2: { name: "Jordan D.", color: "#8D7A7A" }
};

export default function TranscriptDetailPage({ params }: PageProps) {
  const { meetingId } = use(params);
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredWord, setHoveredWord] = useState<Word | null>(null);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const r = await getRoom(meetingId);
        setRoom(r);
      } catch (err) {
        console.warn("Could not load room details, showing fallback layouts", err);
      }
    };
    fetchRoomDetails();
  }, [meetingId]);

  const handleDownload = () => {
    const textContent = MOCK_TRANSCRIPT.utterances
      .map(ut => {
        const speakerInfo = SPEAKER_NAMES[ut.speaker] || { name: `Speaker ${ut.speaker}` };
        const ts = new Date(ut.start * 1000).toISOString().substr(14, 5);
        return `[${ts}] ${speakerInfo.name}: ${ut.text}`;
      })
      .join('\n\n');

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transcript-${room?.title || 'meeting'}-${meetingId}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTimestamp = (seconds: number): string => {
    const date = new Date(seconds * 1000);
    return date.toISOString().substr(14, 5); // MM:SS format
  };

  const getFilteredUtterances = () => {
    if (!searchTerm.trim()) return MOCK_TRANSCRIPT.utterances;
    return MOCK_TRANSCRIPT.utterances.filter(ut => 
      ut.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (SPEAKER_NAMES[ut.speaker]?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

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
            <MessageSquareQuote className="w-5 h-5 text-[#9CC5A1]" />
            <h1 className="text-md font-semibold text-[#FBF5DD]">Audio Transcript</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-semibold hover:bg-white/5 transition-all text-[#D9D3BC] hover:text-[#FBF5DD]"
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

      {/* Main Workspace */}
      <main className="max-w-4xl mx-auto px-6 pt-8 space-y-6">
        {/* Room details header */}
        <div className="rounded-2xl p-6 bg-[#1C2A2C] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#FBF5DD]">
              {room?.title || 'Morning Standup'}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-white/50">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#9CC5A1]" />
                June 27, 2026
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-[#9CC5A1]" />
                {MOCK_TRANSCRIPT.duration_sec}s processed
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#9CC5A1]" />
                {(MOCK_TRANSCRIPT.confidence * 100).toFixed(1)}% word confidence
              </span>
            </div>
          </div>
          
          {/* Search bar */}
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

        {/* Word Details Popover (Hover info) */}
        {hoveredWord && (
          <div className="fixed bottom-6 right-6 bg-[#273338] border border-white/10 p-4 rounded-xl shadow-2xl z-40 max-w-xs space-y-2 text-xs transition-all duration-300">
            <p className="font-semibold text-[#9CC5A1] flex items-center gap-1">
              <Sparkles size={12} />
              Deepgram Word Details
            </p>
            <div className="space-y-1 text-white/70">
              <p>Word: <span className="text-white font-medium">"{hoveredWord.word.replace(/[.,?/]/g, '')}"</span></p>
              <p>Timing: <span className="text-white">{hoveredWord.start.toFixed(2)}s - {hoveredWord.end.toFixed(2)}s</span></p>
              <p>Confidence: <span className="text-white">{(hoveredWord.confidence * 100).toFixed(2)}%</span></p>
            </div>
          </div>
        )}

        {/* Diarized Conversation Bubbles */}
        <div className="space-y-6">
          {getFilteredUtterances().map((ut, index) => {
            const speaker = SPEAKER_NAMES[ut.speaker] || { name: `Speaker ${ut.speaker}`, color: '#8D7A7A' };
            
            return (
              <div 
                key={index} 
                className="flex gap-4 p-4 rounded-2xl bg-[#1C2A2C] border border-white/5 transition-all hover:bg-[#1E2E30]/60"
              >
                {/* Speaker avatar / badge */}
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: speaker.color }}
                >
                  {speaker.name.charAt(0)}
                </div>

                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 
                      className="text-xs font-bold"
                      style={{ color: speaker.color }}
                    >
                      {speaker.name}
                    </h3>
                    <span className="text-[10px] text-white/35 flex items-center gap-1 font-mono">
                      <Clock size={10} />
                      {formatTimestamp(ut.start)}
                    </span>
                  </div>

                  {/* Words rendering with individual hover states */}
                  <p className="text-sm leading-relaxed text-white/80 select-text flex flex-wrap gap-x-1 gap-y-1.5">
                    {ut.words.map((w, wIdx) => (
                      <span
                        key={wIdx}
                        onMouseEnter={() => setHoveredWord(w)}
                        onMouseLeave={() => setHoveredWord(null)}
                        className="cursor-help hover:text-[#9CC5A1] hover:underline decoration-[#9CC5A1]/40 underline-offset-4 transition-colors duration-100"
                        style={{
                          opacity: w.confidence < 0.90 ? 0.7 : 1 // Dim lower confidence words slightly
                        }}
                      >
                        {w.word}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            );
          })}

          {getFilteredUtterances().length === 0 && (
            <div className="text-center py-16 text-white/30 space-y-2">
              <MessageSquareQuote className="w-12 h-12 mx-auto opacity-30" />
              <p className="text-sm font-medium">No matches found in transcript</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
