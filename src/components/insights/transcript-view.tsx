import type { TranscriptData } from '@/services/transcript-service';
import { FileText, User } from 'lucide-react';
import { groupWordsIntoUtterances } from '@/services/transcript-service';

type TranscriptViewProps = {
  transcript: TranscriptData;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Speaker-diarized transcript, grouped into utterances from word-level data. */
export function TranscriptView({ transcript }: TranscriptViewProps) {
  const utterances = groupWordsIntoUtterances(transcript.words_json ?? []);

  return (
    <div className="rounded-2xl border border-white/5 bg-[#1C2A2C] p-6">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wider text-[var(--color-chat-accent)] uppercase">
        <FileText size={16} />
        Full Transcript
      </h3>

      {utterances.length === 0
        ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-white/80">
              {transcript.text}
            </p>
          )
        : (
            <div className="space-y-4">
              {utterances.map((u, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex w-20 shrink-0 flex-col items-start gap-0.5">
                    <span className="flex items-center gap-1 text-xs font-semibold text-[var(--color-chat-accent)]">
                      <User size={11} />
                      Speaker
                      {' '}
                      {u.speaker + 1}
                    </span>
                    <span className="text-[10px] text-white/30">{formatTime(u.start)}</span>
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-white/80">{u.text}</p>
                </div>
              ))}
            </div>
          )}
    </div>
  );
}
