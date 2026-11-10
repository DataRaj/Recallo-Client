/** Fictional demonstration content. Never customer data or a live meeting. */
export const meetingExample = {
  title: 'Launch Planning',
  discussion: 'Review the updated launch timeline and outstanding dependencies.',
  keyPoint: 'The revised draft needs to be shared before the launch review.',
  decision: 'Move the launch review to Thursday.',
  action: 'Priya will share the revised draft before the review.',
  participants: [
    { name: 'Priya', initials: 'P', tone: 'sage' },
    { name: 'Alex', initials: 'A', tone: 'clay' },
    { name: 'You', initials: 'Y', tone: 'ink' },
  ],
  transcript: [
    { time: '04:18', speaker: 'Speaker 1', text: 'Let’s move the launch review to Thursday.' },
    { time: '04:26', speaker: 'Speaker 2', text: 'I’ll share the revised draft before the review.' },
  ],
} as const;

export const marketingLinks = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#the-meeting', label: 'The meeting' },
  { href: '#the-record', label: 'The record' },
] as const;
