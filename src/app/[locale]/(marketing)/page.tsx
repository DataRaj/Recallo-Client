import type { Metadata } from 'next';
import { ArrowDown, Check, ChevronDown, CornerDownRight } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { ActionPair } from '@/components/marketing/actions';
import { meetingExample as example } from '@/components/marketing/example';
import { MeetingShowcase } from '@/components/marketing/meeting-showcase';
import { HeroComposition, RecordIllustration } from '@/components/marketing/product-illustrations';

export const metadata: Metadata = {
  title: 'Recallo — Have the conversation. Keep the context.',
  description: 'Meet in the browser with video, screen sharing and chat. Return to transcripts, decisions and action items when meeting insights are available.',
};

const journey = [
  { stage: 'Before', title: 'Get ready to join.', text: 'Create a room or open an invitation. Check your camera, microphone and available devices before entering.', detail: 'Your room. Your devices. Ready.' },
  { stage: 'During', title: 'Stay with the conversation.', text: 'Talk face to face, share your screen, and use chat when a message belongs alongside the discussion.', detail: 'People, ideas and a shared view.' },
  { stage: 'After', title: 'Return to the details.', text: 'When meeting insights are ready, review the transcript, key discussion points, decisions and action items.', detail: 'The thread is still there.' },
];

const useCases = [
  { title: 'Project check-ins', text: 'Discuss what changed and what is blocked. Return to the decisions that guide the next working session.', outcome: 'A direction for the next session' },
  { title: 'Client conversations', text: 'Work through feedback together. Revisit the agreed direction before preparing the next draft.', outcome: 'The context behind the feedback' },
  { title: 'Discovery interviews', text: 'Give the person speaking your attention. Use the available transcript to revisit details and compare interpretations afterward.', outcome: 'Details worth a second look' },
  { title: 'Distributed working sessions', text: 'Bring a shared problem into view. Keep the resulting decisions close for the next handover.', outcome: 'A clearer place to pick up' },
];

const questions = [
  { question: 'How do I join a meeting?', answer: 'Choose Join a meeting and enter the room ID or paste an invitation link. You will be asked to sign in before entering the meeting.' },
  { question: 'Can I check my devices first?', answer: 'The pre-join screen lets you check your camera, microphone and available devices before connecting. Your browser may ask for permission to use them.' },
  { question: 'What can I revisit afterward?', answer: 'When insights are available, the meeting’s insights page shows processing progress and can display a transcript and structured summary. Results are not guaranteed for every meeting.' },
  { question: 'Can I share my screen or send a message?', answer: 'The meeting interface includes screen sharing and in-meeting chat. Available sharing options depend on your browser and device.' },
];

export default async function Index({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <section className="mk-hero mk-container" aria-labelledby="hero-title">
        <div className="mk-hero-copy">
          <p className="mk-category">
            <span aria-hidden="true" />
            Browser-based meetings
          </p>
          <h1 id="hero-title">Have the conversation. Keep the context.</h1>
          <p className="mk-lead">Meet online, stay focused on the people in the room, and return to the important details afterward.</p>
          <ActionPair helper />
          <a className="mk-hero-next" href="#how-it-works">
            <ArrowDown size={15} aria-hidden="true" />
            Follow the conversation
          </a>
        </div>
        <HeroComposition />
      </section>

      <section className="mk-problem mk-container" aria-labelledby="problem-title">
        <div className="mk-problem-heading">
          <h2 id="problem-title">
            Conversations move.
            <br />
            Details get lost.
          </h2>
          <div>
            <p className="mk-lead">A call brings people together. The decisions and next steps still need somewhere to land.</p>
            <p>Recallo connects the meeting with a place to revisit its transcript and summary when insights are available.</p>
          </div>
        </div>
        <div className="mk-conversation-line">
          <div>
            <span className="mk-small-label">In the conversation</span>
            <p>
              “
              {example.transcript[0].text}
              ”
            </p>
          </div>
          <CornerDownRight className="mk-line-arrow" size={22} aria-hidden="true" />
          <div>
            <span className="mk-small-label">In the record</span>
            <p>{example.decision}</p>
          </div>
          <span className="mk-line-caption">Illustrative example</span>
        </div>
      </section>

      <section id="how-it-works" className="mk-journey" aria-labelledby="journey-title">
        <div className="mk-container">
          <div className="mk-section-heading">
            <span className="mk-chapter">01 / The thread</span>
            <h2 id="journey-title">
              One conversation,
              <br />
              three connected moments.
            </h2>
          </div>
          <ol className="mk-journey-list">
            {journey.map((item, index) => (
              <li key={item.stage}>
                <div className="mk-journey-marker">
                  <span>
                    0
                    {index + 1}
                  </span>
                  <span>{item.stage}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <span className="mk-journey-detail">{item.detail}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="the-meeting" className="mk-live-section mk-container" aria-labelledby="meeting-title">
        <div className="mk-section-heading mk-heading-split">
          <div>
            <span className="mk-chapter">02 / In the room</span>
            <h2 id="meeting-title">
              Made for the
              <br />
              meeting itself.
            </h2>
          </div>
          <p className="mk-lead">The conversation stays central, with the essentials close at hand.</p>
        </div>
        <MeetingShowcase />
        <div className="mk-showcase-notes">
          <p>
            <span>01</span>
            <strong>See the room.</strong>
            {' '}
            A participant grid for the conversation.
          </p>
          <p>
            <span>02</span>
            <strong>Bring something into view.</strong>
            {' '}
            Share your screen and focus together.
          </p>
          <p>
            <span>03</span>
            <strong>Add a message.</strong>
            {' '}
            Keep chat alongside the call.
          </p>
        </div>
      </section>

      <section id="the-record" className="mk-record-section" aria-labelledby="record-title">
        <div className="mk-container mk-record-layout">
          <div className="mk-record-copy">
            <span className="mk-chapter">03 / What stays</span>
            <h2 id="record-title">When the meeting ends, the useful part can stay.</h2>
            <p className="mk-lead">Come back to a readable account of the discussion.</p>
            <p>Meeting insights can include a transcript, a summary, decisions and follow-up actions.</p>
            <div className="mk-record-index">
              <span>
                <Check size={15} aria-hidden="true" />
                The points you discussed
              </span>
              <span>
                <Check size={15} aria-hidden="true" />
                The decisions you reached
              </span>
              <span>
                <Check size={15} aria-hidden="true" />
                The next steps to revisit
              </span>
            </div>
            <p className="mk-caption mk-insights-note">Insights take time to process and may not be available for every meeting. Review generated content against the conversation before relying on it.</p>
          </div>
          <RecordIllustration full />
        </div>
      </section>

      <section className="mk-use-cases mk-container" aria-labelledby="uses-title">
        <div className="mk-uses-heading">
          <h2 id="uses-title">
            For conversations
            <br />
            you need to pick up again.
          </h2>
          <span className="mk-caption">
            Different conversations.
            <br />
            The same need for context.
          </span>
        </div>
        <div>
          {useCases.map(item => (
            <article className="mk-use-row" key={item.title}>
              <h3>{item.title}</h3>
              <div>
                <p>{item.text}</p>
                <span className="mk-use-outcome">
                  <CornerDownRight size={14} aria-hidden="true" />
                  {item.outcome}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mk-questions mk-container" aria-labelledby="questions-title">
        <h2 id="questions-title">Before your first conversation.</h2>
        <div className="mk-question-list">
          {questions.map(item => (
            <details key={item.question}>
              <summary>
                {item.question}
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mk-closing" aria-labelledby="closing-title">
        <div className="mk-container">
          <span className="mk-closing-note">An invitation to connect</span>
          <h2 id="closing-title">
            Make room for
            <br />
            the conversation.
          </h2>
          <p>Bring people together in the browser. Return to the details when meeting insights are available.</p>
          <ActionPair />
        </div>
      </section>
    </>
  );
}
