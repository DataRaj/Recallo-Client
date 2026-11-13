'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const stories = [
  { kind: 'calendar', number: '01', title: 'Make room before the meeting.', text: 'A calendar that could bring the invitation, the people and the preparation into one place.', steps: ['Compare the week', 'Choose a time', 'Keep the brief close'] },
  { kind: 'webinar', number: '02', title: 'Give the conversation a stage.', text: 'A webinar experience built around a considered programme, a clear presentation and room for audience questions.', steps: ['Prepare the programme', 'Take the stage', 'Bring in a question'] },
  { kind: 'broadcast', number: '03', title: 'Let the room reach further.', text: 'A broadcast workspace that could connect the conversation to an audience beyond the call.', steps: ['Prepare the source', 'Check the output', 'Open the broadcast'] },
] as const;

type Kind = (typeof stories)[number]['kind'];

function CalendarScene({ step, calm }: { step: number; calm: boolean }) {
  return (
    <div className="mk-calendar-scene">
      <div className="mk-scene-heading">
        <strong>The working week</strong>
        <span>Sample schedule · local time</span>
      </div>
      <div className="mk-week">
        {['Wed', 'Thu', 'Fri'].map((day, i) => (
          <div className="mk-day" key={day}>
            <span>{day}</span>
            <strong>{14 + i}</strong>
            <div className="mk-calendar-rule" />
            <div className="mk-calendar-rule" />
            <div className="mk-calendar-rule" />
          </div>
        ))}
        <motion.div className="mk-calendar-event" initial={false} animate={{ x: step >= 1 ? '100%' : '0%' }} transition={calm ? { duration: 0 } : { type: 'spring', stiffness: 48, damping: 24, mass: 1.15 }}>
          <strong>Launch review</strong>
          <span>{step >= 1 ? 'Thu · 11:00' : 'Time to agree'}</span>
        </motion.div>
      </div>
      <div className="mk-scene-note">
        <span className="mk-editorial-label">MEETING CONTEXT</span>
        <strong>{step === 2 ? 'Brief attached to the conversation' : 'A little preparation goes a long way.'}</strong>
        <p>{step === 2 ? 'Launch timeline · outstanding dependencies · revised draft' : 'Agree on a time, then bring the right context with you.'}</p>
      </div>
    </div>
  );
}

function WebinarScene({ step, calm }: { step: number; calm: boolean }) {
  const indicatorId = useId();
  return (
    <div className="mk-webinar-scene">
      <div className="mk-scene-heading">
        <strong>Inside the launch</strong>
        <span>{step === 0 ? 'Programme preview' : 'On stage · concept'}</span>
      </div>
      <div className="mk-webinar-stage">
        <div className="mk-speaker-avatar">PS</div>
        <div>
          <span className="mk-editorial-label">PRIYA SHAH / SPEAKER</span>
          <h4>{step === 0 ? 'A place for the story.' : 'From first draft to launch.'}</h4>
          <p>What changed, what we learned, what comes next.</p>
        </div>
      </div>
      <ol className="mk-programme">
        {['01 / The introduction', '02 / The presentation', '03 / The discussion'].map((label, index) => (
          <li key={label} className={step === index ? 'mk-programme-current' : ''}>
            {label}
            {step === index && <motion.span className="mk-programme-indicator" layoutId={indicatorId} transition={calm ? { duration: 0 } : { type: 'spring', stiffness: 55, damping: 24, mass: 1.1 }} />}
          </li>
        ))}
      </ol>
      <div className="mk-scene-note">
        <span className="mk-editorial-label">{step === 2 ? 'AUDIENCE QUESTION / EXAMPLE' : 'PREPARED FOR THE SESSION'}</span>
        <strong>{step === 2 ? 'What would you do differently next time?' : 'A clear programme. Space to contribute.'}</strong>
        <p>{step === 2 ? 'Alex · a question to carry into the discussion.' : 'Keep the presentation and the discussion connected.'}</p>
      </div>
    </div>
  );
}

function BroadcastScene({ step, calm }: { step: number; calm: boolean }) {
  return (
    <div className="mk-broadcast-scene">
      <div className="mk-scene-heading">
        <strong>From the room, outwards</strong>
        <span>Broadcast concept</span>
      </div>
      <div className="mk-broadcast-monitor">
        <span className="mk-editorial-label">SOURCE PREVIEW</span>
        <h4>The launch conversation.</h4>
        <div className="mk-source-people">
          <span>PS</span>
          <span>AM</span>
          <span>YOU</span>
        </div>
        <span className="mk-monitor-caption">A conversation worth sharing.</span>
      </div>
      <div className="mk-signal-path">
        <span>Meeting room</span>
        <span className="mk-signal-line"><motion.span initial={false} animate={{ scaleX: step >= 1 ? 1 : 0 }} style={{ transformOrigin: 'left' }} transition={{ duration: calm ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }} /></span>
        <span>{step === 2 ? 'Audience' : 'Preview output'}</span>
      </div>
      <div className="mk-scene-note">
        <span className="mk-editorial-label">{step === 2 ? 'BROADCAST STATE / EXAMPLE' : 'OUTPUT CHECK'}</span>
        <strong>{step === 0 ? 'Start with the conversation.' : step === 1 ? 'Check before you go further.' : 'The conversation reaches its audience.'}</strong>
        <p>{step === 0 ? 'Prepare the room and the people who will be speaking.' : step === 1 ? 'Review the picture and sound before opening the broadcast.' : 'An illustrative destination, not a connected streaming service.'}</p>
      </div>
    </div>
  );
}

export function DirectionStories() {
  const [selected, setSelected] = useState(0);
  const [positions, setPositions] = useState<Record<Kind, number>>({ calendar: 0, webinar: 0, broadcast: 0 });
  const [playing, setPlaying] = useState(false);
  const calm = useReducedMotion();
  const id = useId();
  const tablist = useRef<HTMLDivElement>(null);
  const story = stories[selected]!;
  const kind = story.kind;
  const step = positions[kind];
  const labels = ['Smart calendar', 'Webinars & events', 'Streaming & broadcasting'];

  const chooseFeature = (index: number) => {
    setPlaying(false);
    setSelected(index);
  };
  const chooseStep = (index: number) => {
    setPlaying(false);
    setPositions(current => ({ ...current, [kind]: index }));
  };

  useEffect(() => {
    if (!playing || calm) {
      return;
    }
    const onVisibility = () => {
      if (document.hidden) {
        setPlaying(false);
      }
    };
    const timer = window.setTimeout(() => {
      if (step === 2) {
        setPlaying(false);
      } else {
        setPositions(current => ({ ...current, [kind]: current[kind] + 1 }));
      }
    }, 3200);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [playing, step, calm, kind]);

  // A preference change also cancels playback so disabling reduced motion cannot restart it.
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stop = () => setPlaying(false);
    preference.addEventListener('change', stop);
    return () => preference.removeEventListener('change', stop);
  }, []);

  return (
    <motion.div className="mk-direction-showcase" onViewportLeave={() => setPlaying(false)} viewport={{ amount: 0.1 }}>
      <div className="mk-feature-tabs" role="tablist" aria-label="Explore future Recallo experiences" ref={tablist}>
        {stories.map((item, index) => (
          <button
            key={item.kind}
            type="button"
            role="tab"
            id={`${id}-tab-${item.kind}`}
            aria-selected={selected === index}
            aria-controls={`${id}-panel`}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => chooseFeature(index)}
            onKeyDown={(event) => {
              let next: number;
              if (event.key === 'ArrowRight') {
                next = (index + 1) % stories.length;
              } else if (event.key === 'ArrowLeft') {
                next = (index + stories.length - 1) % stories.length;
              } else if (event.key === 'Home') {
                next = 0;
              } else if (event.key === 'End') {
                next = stories.length - 1;
              } else {
                return;
              }
              event.preventDefault();
              chooseFeature(next);
              tablist.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
            }}
          >
            <span className="mk-editorial-label">{item.number}</span>
            <span>{labels[index]}</span>
            {selected === index && <motion.span className="mk-feature-tab-indicator" layoutId={`${id}-feature`} transition={calm ? { duration: 0 } : { type: 'spring', stiffness: 55, damping: 25, mass: 1.1 }} />}
          </button>
        ))}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${kind}`} tabIndex={0} className="mk-feature-panel">
        <article className={`mk-direction mk-direction-${kind}`}>
          <div className="mk-direction-copy">
            <span className="mk-editorial-label">{`${story.number} / EXPLORING`}</span>
            <h3>{story.title}</h3>
            <p>{story.text}</p>
            <ol className="mk-story-steps" aria-label={`${labels[selected]} walkthrough`}>
              {story.steps.map((label, index) => (
                <li key={label}>
                  <button type="button" aria-pressed={index === step} aria-controls={`${id}-scene`} onClick={() => chooseStep(index)}>
                    <span>{`0${index + 1}`}</span>
                    {label}
                    <ArrowRight size={15} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <figure className="mk-direction-demo">
            <div id={`${id}-scene`} className="mk-scene" role="group" aria-label={`${labels[selected]} concept: ${story.steps[step]}`}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={kind} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: calm ? 0 : 0.3 }}>
                  {kind === 'calendar' ? <CalendarScene step={step} calm={calm} /> : kind === 'webinar' ? <WebinarScene step={step} calm={calm} /> : <BroadcastScene step={step} calm={calm} />}
                </motion.div>
              </AnimatePresence>
              <p className="mk-scene-caption" aria-live={playing ? 'off' : 'polite'}>{`${story.number} / ${labels[selected]} · Step ${step + 1} of 3 · ${story.steps[step]}`}</p>
            </div>
            <figcaption>
              <span>Illustrative concept / exploring</span>
              {!calm && (
                <button
                  type="button"
                  aria-pressed={playing}
                  aria-label={`${playing ? 'Pause' : step === 2 ? 'Replay' : 'Play'} ${labels[selected]} story`}
                  onClick={() => {
                    if (!playing && step === 2) {
                      setPositions(current => ({ ...current, [kind]: 0 }));
                    }
                    setPlaying(value => !value);
                  }}
                >
                  {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
                  {playing ? 'Pause story' : step === 2 ? 'Replay story' : 'Play story'}
                </button>
              )}
            </figcaption>
          </figure>
        </article>
      </div>
    </motion.div>
  );
}
