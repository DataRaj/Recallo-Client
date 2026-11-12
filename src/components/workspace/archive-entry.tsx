import { ArrowRight, FileText, Mic, NotebookPen } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { Link } from '@/libs/i18n-navigation';

const content = {
  transcripts: {
    index: 'The record',
    title: 'Transcripts',
    Icon: FileText,
    headline: 'Go back to the conversation.',
    detail: 'Transcripts are accessed from individual meetings when available. Open a meeting to check its recording and insight status.',
  },
  summaries: {
    index: 'The follow-up',
    title: 'Summaries',
    Icon: NotebookPen,
    headline: 'Find the decisions and next steps.',
    detail: 'When a meeting summary is available, you can read it alongside the original transcript in meeting insights.',
  },
  webinars: {
    index: 'Bring people together',
    title: 'Webinars',
    Icon: Mic,
    headline: 'Looking for a webinar?',
    detail: 'Your recent webinar rooms appear on Home after you open them in this browser. You can also join a room using an invitation or room ID.',
  },
};

export function ArchiveEntry({ kind }: { kind: keyof typeof content }) {
  const entry = content[kind];
  const isWebinar = kind === 'webinars';
  return (
    <div className="app-workspace">
      <header className="app-page-heading">
        <p className="app-eyebrow">{entry.index}</p>
        <h1>{entry.title}</h1>
      </header>
      <section className="app-archive-entry">
        <entry.Icon size={32} strokeWidth={1.5} aria-hidden="true" />
        <div>
          <h2>{entry.headline}</h2>
          <p>{entry.detail}</p>
          <Link href={isWebinar ? ROUTES.HOME : ROUTES.MEETINGS} className="app-text-link">
            {isWebinar ? 'Go to Home' : 'Browse meetings'}
            {' '}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
