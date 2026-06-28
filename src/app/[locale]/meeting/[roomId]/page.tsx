'use client';

import { use } from 'react';
import { MeetingGate } from '@/components/meeting/meeting-gate';

type PageProps = {
  params: Promise<{
    roomId: string;
    locale: string;
  }>;
};

export default function MeetingPage({ params }: PageProps) {
  const { roomId } = use(params);
  return <MeetingGate roomId={roomId} />;
}
