'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { Pause, Play } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { meetingExample as example } from './example';
import { ChatExcerpt, MeetingIllustration, SummaryExcerpt, TranscriptExcerpt } from './product-illustrations';

const views = ['Meeting', 'Transcript', 'Summary'] as const;
const excerpts = { Meeting: ChatExcerpt, Transcript: TranscriptExcerpt, Summary: SummaryExcerpt };

export function MeetingShowcase() {
  const [view, setView] = useState<(typeof views)[number]>('Summary');
  const panelId = useId();
  const reducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const Excerpt = excerpts[view];

  useEffect(() => {
    if (!playing || reducedMotion) {
      return;
    }
    const pause = () => {
      if (document.hidden) {
        setPlaying(false);
      }
    };
    document.addEventListener('visibilitychange', pause);
    const timer = window.setTimeout(() => {
      const next = views[views.indexOf(view) + 1];
      if (next) {
        setView(next);
      } else {
        setPlaying(false);
      }
    }, 2600);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', pause);
    };
  }, [playing, reducedMotion, view]);

  return (
    <figure id="the-meeting" className="mk-product">
      <div className="mk-product-toolbar">
        <span className="mk-product-title">{example.title}</span>
        <div className="mk-view-controls" role="group" aria-label="Explore the example meeting">
          {views.map(label => (
            <button
              type="button"
              key={label}
              aria-pressed={view === label}
              aria-controls={panelId}
              onClick={() => {
                setPlaying(false);
                setView(label);
              }}
            >
              {view === label && <motion.span className="mk-view-indicator" layoutId={`${panelId}-selection`} transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 65, damping: 26, mass: 1.1 }} />}
              <span>{label}</span>
            </button>
          ))}
        </div>
        {!reducedMotion && (
          <button
            type="button"
            className="mk-walkthrough"
            aria-pressed={playing}
            onClick={() => {
              if (!playing) {
                setView('Meeting');
              }
              setPlaying(value => !value);
            }}
          >
            {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
            {playing ? 'Pause walkthrough' : 'Play walkthrough'}
          </button>
        )}
      </div>
      <div className="mk-product-body">
        <MeetingIllustration />
        <div id={panelId} className="mk-example-panel" role="region" aria-label={`Example ${view.toLowerCase()}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={view} className="mk-preview-state" initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reducedMotion ? 0 : -4 }} transition={{ duration: reducedMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}><Excerpt /></motion.div>
          </AnimatePresence>
        </div>
      </div>
      <figcaption>Illustrative meeting, transcript, and summary</figcaption>
    </figure>
  );
}
