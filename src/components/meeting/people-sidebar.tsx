
'use client';

import { memo } from 'react';
import { useParticipants } from '@livekit/components-react';
import { X, MicOff, VideoOff, Hand } from 'lucide-react';
import { colorFor, initialsFor } from '@/components/meeting/avatar';
import { useMeetingStore } from '@/stores/use-meeting-store';

function PeopleSidebarImpl() {
    const participants = useParticipants();
    const setSidebar = useMeetingStore(s => s.setSidebar);
    const raisedHands = useMeetingStore(s => s.raisedHands);

    return (
        <aside
            className="flex min-h-0 w-[290px] shrink-0 flex-col sm:w-[310px]"
            style={{ background: '#1C2A2C', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
        >
            <div
                className="flex shrink-0 items-center justify-between px-3 py-2.5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
                <div>
                    <p className="text-[12px] font-medium" style={{ color: '#FBF5DD' }}>Participants</p>
                    <p className="mt-0.5 text-[10px]" style={{ color: 'rgba(251,245,221,0.35)' }}>
                        {participants.length} in room
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setSidebar('none')}
                    className="rounded-[6px] p-1.5 hover:bg-white/10"
                    style={{ color: 'rgba(251,245,221,0.45)' }}
                    title="Close"
                >
                    <X size={14} />
                </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
                {participants.map(p => {
                    const name = p.name || p.identity;
                    return (
                        <div key={p.identity} className="flex items-center justify-between rounded-lg p-2 hover:bg-white/5">
                            <div className="flex min-w-0 items-center gap-3">
                                <div
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                                    style={{ background: colorFor(p.identity) }}
                                >
                                    {initialsFor(name)}
                                </div>
                                <p className="truncate text-[13px] font-medium text-[#FBF5DD]">
                                    {name}
                                    {p.isLocal && ' (You)'}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1.5">
                                {raisedHands[p.identity] && <Hand size={13} style={{ color: '#E5B567' }} />}
                                {!p.isMicrophoneEnabled && <MicOff size={13} style={{ color: 'rgba(251,245,221,0.4)' }} />}
                                {!p.isCameraEnabled && <VideoOff size={13} style={{ color: 'rgba(251,245,221,0.4)' }} />}
                            </div>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}

export const PeopleSidebar = memo(PeopleSidebarImpl);
