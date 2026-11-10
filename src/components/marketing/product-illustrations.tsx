import { ArrowDown, Hand, MessageSquare, Mic, MicOff, MonitorUp, Phone, Video } from 'lucide-react';
import { meetingExample as example } from './example';

export function MeetingIllustration({ expanded = false, focus = false }: { expanded?: boolean; focus?: boolean }) {
  return (
    <div className={`mk-meeting${expanded ? ' mk-meeting-expanded' : ''}`}>
      <div className="mk-meeting-top">
        <span className="mk-meeting-wordmark">
          recallo
          <span aria-hidden="true">.</span>
        </span>
        <span>{example.title}</span>
        <span className="mk-preview-label">Example room</span>
      </div>
      <div className="mk-meeting-body">
        {focus && (
          <div className="mk-screen-example">
            <div className="mk-screen-toolbar">
              <MonitorUp size={14} aria-hidden="true" />
              Illustrative shared screen
            </div>
            <div className="mk-shared-document">
              <span className="mk-small-label">Launch Planning / Working draft</span>
              <h3>The next review.</h3>
              <p>{example.discussion}</p>
              <div className="mk-shared-note">
                <span>01</span>
                <p>{example.decision}</p>
              </div>
              <div className="mk-shared-note">
                <span>02</span>
                <p>{example.action}</p>
              </div>
            </div>
          </div>
        )}
        <div className={`mk-participants${focus ? ' mk-participants-strip' : ''}`}>
          {example.participants.map(person => (
            <div className={`mk-participant mk-participant-${person.tone}`} key={person.name}>
              <div className="mk-person-initial" aria-hidden="true">{person.initials}</div>
              <span className="mk-camera-off">Camera off</span>
              <span className="mk-person-name">{person.name}</span>
              <MicOff size={12} className="mk-person-muted" aria-hidden="true" />
            </div>
          ))}
        </div>
        {expanded && (
          <aside className="mk-example-chat" aria-label="Illustrative meeting chat">
            <div className="mk-chat-heading">
              <MessageSquare size={14} aria-hidden="true" />
              Meeting chat
            </div>
            <div className="mk-chat-message">
              <strong>Priya</strong>
              <p>I’ll share the revised draft before the review.</p>
            </div>
            <div className="mk-chat-message">
              <strong>Alex</strong>
              <p>Thursday works. Let’s review the timeline together.</p>
            </div>
            <p className="mk-chat-note">Example conversation</p>
          </aside>
        )}
      </div>
      <div className="mk-example-dock" role="group" aria-label="Illustrative meeting controls">
        {[
          { icon: Mic, label: 'Mic' },
          { icon: Video, label: 'Camera' },
          { icon: MonitorUp, label: 'Share' },
          { icon: MessageSquare, label: 'Chat' },
          { icon: Hand, label: 'Raise' },
          { icon: Phone, label: 'Leave' },
        ].map(({ icon: Icon, label }) => (
          <span key={label} className={label === 'Leave' ? 'mk-dock-item mk-dock-leave' : 'mk-dock-item'}>
            <Icon size={16} aria-hidden="true" />
            <span>{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function TranscriptIllustration() {
  return (
    <div className="mk-transcript-example">
      <div className="mk-document-meta">
        <span>{example.title}</span>
        <span>Example transcript</span>
      </div>
      <h3>The conversation, in words.</h3>
      {example.transcript.map(line => (
        <div className="mk-transcript-row" key={line.time}>
          <div>
            <span>{line.time}</span>
            <strong>{line.speaker}</strong>
          </div>
          <p>{line.text}</p>
        </div>
      ))}
      <p className="mk-caption">Fictional excerpts. Timestamps are illustrative, with no audio playback.</p>
    </div>
  );
}

export function RecordIllustration({ full = false }: { full?: boolean }) {
  return (
    <article className="mk-record" aria-label="Illustrative Launch Planning summary">
      <div className="mk-document-meta">
        <span>Meeting record</span>
        <span>Example summary</span>
      </div>
      <h3>{example.title}</h3>
      <p className="mk-record-intro">A conversation. A direction to return to.</p>
      {full && (
        <div className="mk-record-row">
          <h4>Discussion</h4>
          <p>{example.discussion}</p>
          <h4>Key discussion point</h4>
          <p>{example.keyPoint}</p>
        </div>
      )}
      <div className="mk-record-row mk-record-decision">
        <h4>Decision</h4>
        <p>{example.decision}</p>
      </div>
      <div className="mk-record-row">
        <h4>Next step</h4>
        <p>{example.action}</p>
      </div>
      {full && (
        <div className="mk-record-transcript">
          <h4>From the transcript</h4>
          {example.transcript.map(line => (
            <blockquote key={line.time}>
              <div className="mk-data">
                {line.time}
                {' '}
                ·
                {' '}
                {line.speaker}
              </div>
              <p>
                “
                {line.text}
                ”
              </p>
            </blockquote>
          ))}
        </div>
      )}
      <p className="mk-record-footnote">Fictional content demonstrating the intended insights format.</p>
    </article>
  );
}

export function HeroComposition() {
  return (
    <figure className="mk-hero-composition">
      <MeetingIllustration />
      <div className="mk-hero-connection">
        <span aria-hidden="true" />
        <ArrowDown size={16} aria-hidden="true" />
        <span>From the conversation</span>
      </div>
      <div className="mk-hero-record">
        <div className="mk-document-meta">
          <span>What we decided</span>
          <span>Example summary</span>
        </div>
        <p>{example.decision}</p>
        <div className="mk-hero-record-bottom">
          <span>Launch Planning</span>
          <a href="#the-record">
            Explore the record
            <ArrowDown size={13} aria-hidden="true" />
          </a>
        </div>
      </div>
      <figcaption>Launch Planning · Illustrative meeting and summary</figcaption>
    </figure>
  );
}
