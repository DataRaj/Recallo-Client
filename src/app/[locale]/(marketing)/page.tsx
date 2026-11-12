import type { Metadata } from 'next';
import { ChevronDown } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { ActionPair } from '@/components/marketing/actions';
import { meetingExample as example } from '@/components/marketing/example';
import { MeetingShowcase } from '@/components/marketing/meeting-showcase';
import { RecordIllustration } from '@/components/marketing/product-illustrations';

export const metadata: Metadata = {
  title: 'Recallo — Meet now. Keep what matters.',
  description: 'Meet in your browser with video, screen sharing and chat. Return to transcripts, decisions and next steps when meeting insights are available.',
};

const steps = [
  { title: 'Get ready to join', text: 'Check your camera, microphone and available devices before entering.' },
  { title: 'Work through it together', text: 'Talk face to face, share your screen and keep chat alongside the call.' },
  { title: 'Return to the details', text: 'When insights are available, review the transcript, decisions and next steps.' },
];

const useCases = [
  { title: 'Project check-ins', text: 'Discuss what changed and what is blocked. Revisit the decisions that guide the next working session.' },
  { title: 'Client conversations', text: 'Work through feedback together. Return to the agreed direction before preparing the next draft.' },
  { title: 'Discovery interviews', text: 'Give the person speaking your attention. Revisit details in the available transcript afterward.' },
  { title: 'Distributed working sessions', text: 'Bring a shared problem into view and keep the resulting decisions close for the next handover.' },
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
      <section className="mk-container mk-opening" aria-labelledby="hero-title">
        <div className="mk-hero-copy">
          <h1 id="hero-title">
            Meet now.
            <br />
            Keep what matters.
          </h1>
          <div className="mk-hero-aside">
            <p>Meet in your browser. Return to the transcript, decisions and next steps when meeting insights are available.</p>
            <ActionPair helper />
          </div>
        </div>
        <MeetingShowcase />
      </section>

      <section id="how-it-works" className="mk-conversation" aria-labelledby="conversation-title">
        <div className="mk-container">
          <div className="mk-conversation-layout">
            <div>
              <h2 id="conversation-title">Stay in the conversation.</h2>
              <p>Share your screen, talk through the work, and keep chat alongside the call.</p>
            </div>
            <blockquote>
              <p>
                “
                {example.transcript[0].text}
                ”
              </p>
              <cite>Launch Planning · Illustrative excerpt, 04:18</cite>
            </blockquote>
          </div>
          <ol className="mk-meeting-steps">
            {steps.map(step => (
              <li key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="the-record" className="mk-container mk-record-section" aria-labelledby="record-title">
        <div className="mk-record-intro">
          <h2 id="record-title">Pick up where you left off.</h2>
          <p>When meeting insights are available, revisit the transcript and review the decisions and next steps in one place.</p>
          <p className="mk-insights-note">Insights take time to process and may not be available for every meeting. Review generated content against the conversation before relying on it.</p>
        </div>
        <RecordIllustration />
      </section>

      <section className="mk-uses" aria-labelledby="uses-title">
        <div className="mk-container mk-uses-layout">
          <h2 id="uses-title">For the conversations you’ll come back to.</h2>
          <div className="mk-use-list">
            {useCases.map(item => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-container mk-practical" aria-labelledby="questions-title">
        <h2 id="questions-title">Before your first call.</h2>
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
        <div className="mk-container mk-closing-content">
          <h2 id="closing-title">Start a conversation.</h2>
          <ActionPair />
        </div>
      </section>
    </>
  );
}
