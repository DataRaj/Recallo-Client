'use client';

import { useId, useState } from 'react';
import { MeetingIllustration, TranscriptIllustration } from './product-illustrations';

const views = ['Grid view', 'Screen focus', 'Transcript'] as const;

export function MeetingShowcase() {
  const [view, setView] = useState<(typeof views)[number]>('Grid view');
  const regionId = useId();
  return (
    <figure className="mk-showcase">
      <div className="mk-showcase-toolbar">
        <span className="mk-small-label">Explore an example</span>
        <div className="mk-view-buttons" role="group" aria-label="Example meeting view">{views.map(label => <button type="button" key={label} aria-pressed={view === label} aria-controls={regionId} onClick={() => setView(label)}>{label}</button>)}</div>
      </div>
      <div id={regionId} className="mk-showcase-viewport" role="region" aria-label={`${view} illustration`}>
        <div key={view} className="mk-preview-state">{view === 'Transcript' ? <TranscriptIllustration /> : <MeetingIllustration expanded focus={view === 'Screen focus'} />}</div>
      </div>
      <figcaption>Illustrative views based on Recallo’s meeting layouts and transcript format. No live connection or camera access.</figcaption>
    </figure>
  );
}
