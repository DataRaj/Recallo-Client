
'use client';

import { memo } from 'react';
import Link from 'next/link';
import { useParticipants } from '@livekit/components-react';
import { Users, Wifi } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { useSessionTimer, formatCountdown } from '@/hooks/use-session-timer';
import { useIsRecording } from '@/hooks/use-is-recording';
import type { Room } from '@/types/room';

interface MeetingHeaderProps {
    room: Room;
    mode?: 'meeting' | 'webinar';
}

function MeetingHeaderImpl({ room, mode: _mode = 'meeting' }: MeetingHeaderProps) {
    const timeRemaining = useSessionTimer(room);
    const participants = useParticipants();
    const isRecording = useIsRecording();
    const low = timeRemaining !== null && timeRemaining < 300;

    return (
        <header
            className="flex h-[56px] shrink-0 items-center justify-between gap-3 px-3 sm:px-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
            <div className="flex min-w-0 items-center gap-2.5">
                <Link href={ROUTES.HOME} className="flex shrink-0 items-center">
                    <div
                        className="flex h-6 w-6 items-center justify-center rounded-[7px] text-[11px] font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg, #BA5A5A, #8A4040)' }}
                    >
                        R
                    </div>
                </Link>
                <div className="h-4 w-px shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }} />
                <div className="min-w-0">
                    <p className="truncate text-[12px] font-medium sm:text-[13px]" style={{ color: '#FBF5DD' }}>
                        {room.title || 'Meeting'}
                    </p>
                    <div className="flex items-center gap-1.5">
                        <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ background: low ? '#BA5A5A' : '#9CC5A1' }}
                        />
                        <span className="text-[10px]" style={{ color: low ? '#BA5A5A' : 'rgba(251,245,221,0.4)' }}>
                            {formatCountdown(timeRemaining)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
                {isRecording && (
                    <div
                        className="flex items-center gap-1.5 rounded-[8px] px-2 py-1"
                        style={{ background: 'rgba(186,90,90,0.15)', color: '#BA5A5A' }}
                        title="This meeting is being recorded"
                    >
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: '#BA5A5A' }} />
                        <span className="text-[10px] font-medium">REC</span>
                    </div>
                )}
                <div
                    className="hidden items-center gap-1.5 rounded-[8px] px-2 py-1 sm:flex"
                    style={{ background: 'rgba(156,197,161,0.12)', color: '#9CC5A1' }}
                >
                    <Wifi size={12} />
                    <span className="text-[10px] font-medium">HD</span>
                </div>
                <div
                    className="flex items-center gap-1.5 rounded-[8px] px-2 py-1"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(251,245,221,0.6)' }}
                >
                    <Users size={12} />
                    <span className="text-[10px]">{participants.length}</span>
                </div>
            </div>
        </header>
    );
}

export const MeetingHeader = memo(MeetingHeaderImpl);
