import type { SummaryData } from '@/services/summary-service';
import {
  Brain,
  Calendar,
  Clock,
  Flag,
  ListTodo,
  Sparkles,
  Tag,
  User,
} from 'lucide-react';
import Link from 'next/link';

type SummaryViewProps = {
  summary: SummaryData;
  title: string;
  durationMins?: number;
  participantCount?: number;
  /** Optional "View Full Transcript" link target. Hidden when omitted. */
  transcriptHref?: string;
};

/**
 * Renders the meeting summary dashboard (title card + executive summary, key
 * points, decisions, action items and tags). Extracted so both the standalone
 * summary page and the unified insights page share one presentation.
 */
export function SummaryView({
  summary,
  title,
  durationMins,
  participantCount,
  transcriptHref,
}: SummaryViewProps) {
  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/5 bg-[#1C2A2C] p-6 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-chat-text)]">{title}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-white/50">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-[var(--color-chat-accent)]" />
              {new Date(summary.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-[var(--color-chat-accent)]" />
              {durationMins != null && durationMins > 0 ? `${durationMins} mins` : '—'}
            </span>
            <span className="flex items-center gap-1.5">
              <User size={13} className="text-[var(--color-chat-accent)]" />
              {typeof participantCount === 'number' ? `${participantCount} attendees` : '—'}
            </span>
          </div>
        </div>

        {transcriptHref != null && transcriptHref !== '' && (
          <Link
            href={transcriptHref}
            className="self-start rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-[var(--color-chat-text-2)] transition-all hover:bg-white/5 hover:text-[var(--color-chat-text)] md:self-auto"
          >
            View Full Transcript
          </Link>
        )}
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Summary & Key Points & Decisions */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-white/5 bg-[#1C2A2C] p-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wider text-[var(--color-chat-accent)] uppercase">
              <Brain size={16} />
              Executive Summary
            </h3>
            <p className="text-sm leading-relaxed font-normal text-white/80">
              {summary.executive_summary}
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#1C2A2C] p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wider text-[var(--color-chat-accent)] uppercase">
              <Sparkles size={16} />
              Key Discussion Points
            </h3>
            <ul className="space-y-3">
              {summary.key_points.map((point, index) => (
                <li key={index} className="flex gap-3 text-sm leading-relaxed text-white/80">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--color-chat-accent)]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#1C2A2C] p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wider text-[var(--color-text-accent)] uppercase">
              <Flag size={16} />
              Decisions Made
            </h3>
            <ul className="space-y-3">
              {summary.decisions_made.map((decision, index) => (
                <li key={index} className="flex gap-3 text-sm leading-relaxed text-white/80">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--color-text-accent)]" />
                  <span>{decision}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Action Items & Tags */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/5 bg-[#1C2A2C] p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wider text-[var(--color-chat-accent)] uppercase">
              <ListTodo size={16} />
              Action Items
            </h3>
            <div className="space-y-4">
              {summary.action_items.map((item, index) => (
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

          <div className="rounded-2xl border border-white/5 bg-[#1C2A2C] p-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wider text-[var(--color-chat-accent)] uppercase">
              <Tag size={16} />
              Discussion Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {summary.discussion_tags.map(tag => (
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
    </div>
  );
}
