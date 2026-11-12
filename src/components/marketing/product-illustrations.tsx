import { MessageSquare, MicOff, MonitorUp, VideoOff } from 'lucide-react';
import { meetingExample as example } from './example';

/** An illustrative screen-share state uses no media permissions or meeting connection. */
export function MeetingIllustration() {
  return (
    <div className="mk-meeting" role="group" aria-label="Illustrative live meeting">
      <div className="mk-meeting-title">
        <span>
          <MonitorUp size={13} aria-hidden="true" />
          Screen share
        </span>
        <span>Priya’s screen</span>
      </div>
      <div className="mk-meeting-content">
        <div className="mk-shared-screen">
          <span className="mk-document-label">Project brief</span>
          <h3>Launch review</h3>
          <p>Updated timeline and open dependencies</p>
          <div className="mk-timeline" role="group" aria-label="Illustrative project milestones">
            <span>
              <strong>Wed</strong>
              Draft
            </span>
            <span className="mk-timeline-selected">
              <strong>Thu</strong>
              Review
            </span>
            <span>
              <strong>Fri</strong>
              Revisions
            </span>
          </div>
        </div>
        <div className="mk-people" role="group" aria-label="Illustrative meeting participants">
          {example.participants.map(person => (
            <div key={person.name}>
              <span className={`mk-initial mk-initial-${person.tone}`} aria-hidden="true">{person.initials}</span>
              <span>{person.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mk-meeting-dock" role="group" aria-label="Illustrative meeting controls">
        <span>
          <MicOff size={13} aria-hidden="true" />
          Mic off
        </span>
        <span>
          <VideoOff size={13} aria-hidden="true" />
          Camera off
        </span>
        <span>
          <MonitorUp size={13} aria-hidden="true" />
          Share screen
        </span>
        <span>
          <MessageSquare size={13} aria-hidden="true" />
          Chat
        </span>
      </div>
    </div>
  );
}

export function SummaryExcerpt() {
  return (
    <div>
      <p className="mk-document-label">Example meeting record</p>
      <h3>What we decided</h3>
      <div className="mk-decision">
        <span className="mk-document-label">Decision</span>
        <p>{example.decision}</p>
      </div>
      <div className="mk-next-step">
        <span className="mk-document-label">Next step</span>
        <p>{example.action}</p>
      </div>
    </div>
  );
}

export function TranscriptExcerpt() {
  return (
    <div>
      <p className="mk-document-label">Example transcript</p>
      <h3>What was said</h3>
      {example.transcript.map(line => (
        <blockquote className="mk-example-message" key={line.time}>
          <span className="mk-document-label">
            {line.time}
            {' '}
            ·
            {' '}
            {line.speaker}
          </span>
          <p>
            “
            {line.text}
            ”
          </p>
        </blockquote>
      ))}
    </div>
  );
}

export function ChatExcerpt() {
  return (
    <div>
      <p className="mk-document-label">Example meeting chat</p>
      <h3>Alongside the call</h3>
      <blockquote className="mk-example-message">
        <span className="mk-document-label">Priya</span>
        <p>
          “
          {example.transcript[1].text}
          ”
        </p>
      </blockquote>
      <blockquote className="mk-example-message">
        <span className="mk-document-label">Alex</span>
        <p>“Thursday works. Let’s review the timeline together.”</p>
      </blockquote>
    </div>
  );
}

export function RecordIllustration() {
  return (
    <figure className="mk-record-sheet">
      <figcaption className="mk-sheet-header">
        <span>Example meeting record</span>
        <span>{example.title}</span>
      </figcaption>
      <dl>
        <div>
          <dt>Discussion</dt>
          <dd>{example.discussion}</dd>
        </div>
        <div className="mk-sheet-decision">
          <dt>Decision</dt>
          <dd>{example.decision}</dd>
        </div>
        <div>
          <dt>Next step</dt>
          <dd>{example.action}</dd>
        </div>
        <div>
          <dt>Transcript</dt>
          <dd>
            {example.transcript.map(line => (
              <blockquote key={line.time}>
                <span className="mk-document-label">
                  {line.time}
                  {' '}
                  ·
                  {' '}
                  {line.speaker}
                </span>
                <p>
                  “
                  {line.text}
                  ”
                </p>
              </blockquote>
            ))}
          </dd>
        </div>
      </dl>
    </figure>
  );
}
