import type { InsightsStep } from '@/services/insights-service';
import { Check, Loader2 } from 'lucide-react';

type PipelineProgressProps = {
  step: InsightsStep;
  message?: string;
};

type StageState = 'done' | 'active' | 'pending';

const STAGES: { key: string; label: string; detail: string }[] = [
  { key: 'recording', label: 'Recording finalized', detail: 'Uploaded to secure storage' },
  { key: 'transcribing', label: 'Transcribing audio', detail: 'Deepgram identifying speakers & timestamps' },
  { key: 'summarizing', label: 'Synthesizing insights', detail: 'AI drafting summary & action items' },
];

/** Maps the backend pipeline step to per-stage state for the 3-stage tracker. */
function stageStates(step: InsightsStep): StageState[] {
  switch (step) {
    case 'live':
    case 'finalizing':
    case 'recording':
      return ['active', 'pending', 'pending'];
    case 'transcribing':
      return ['done', 'active', 'pending'];
    case 'summarizing':
      return ['done', 'done', 'active'];
    case 'completed':
      return ['done', 'done', 'done'];
    case 'failed':
    default:
      return ['pending', 'pending', 'pending'];
  }
}

export function PipelineProgress({ step, message }: PipelineProgressProps) {
  const states = stageStates(step);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-white/5 bg-[#1C2A2C] p-8">
      <h2 className="mb-1 text-center text-lg font-bold text-[var(--color-chat-text)]">
        Generating your meeting insights
      </h2>
      <p className="mb-8 text-center text-sm text-white/50">
        {message != null && message !== ''
          ? message
          : 'This usually takes under a minute. You can safely stay on this page.'}
      </p>

      <ol className="space-y-5">
        {STAGES.map((stage, i) => {
          const state = states[i]!;
          return (
            <li key={stage.key} className="flex items-start gap-4">
              <div
                className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border transition-all ${
                  state === 'done'
                    ? 'border-[var(--color-chat-accent)] bg-[var(--color-chat-accent)]/15 text-[var(--color-chat-accent)]'
                    : state === 'active'
                      ? 'border-[var(--color-chat-accent)]/40 bg-transparent text-[var(--color-chat-accent)]'
                      : 'border-white/10 bg-transparent text-white/30'
                }`}
              >
                {state === 'done'
                  ? <Check size={16} />
                  : state === 'active'
                    ? <Loader2 size={16} className="animate-spin" />
                    : <span className="text-xs font-semibold">{i + 1}</span>}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${
                    state === 'pending' ? 'text-white/40' : 'text-[var(--color-chat-text)]'
                  }`}
                >
                  {stage.label}
                </p>
                <p className="text-xs text-white/40">{stage.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
