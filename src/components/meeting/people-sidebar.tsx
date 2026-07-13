'use client';

import { useParticipants } from '@livekit/components-react';
import { Hand, Loader2, MessageSquare, MicOff, VideoOff, X } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { colorFor, initialsFor } from '@/components/meeting/avatar';
import { ROUTES } from '@/lib/routes';
import { createConversation } from '@/services/chat-service';
import { useMeetingStore } from '@/stores/use-meeting-store';
import { parseUserId } from '@/utils/identity';

function PeopleSidebarImpl() {
  const participants = useParticipants();
  const setSidebar = useMeetingStore(s => s.setSidebar);
  const raisedHands = useMeetingStore(s => s.raisedHands);
  const router = useRouter();
  const locale = useLocale();

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const openDm = useCallback(async (identity: string) => {
    const uid = parseUserId(identity);
    if (uid === null) {
      return;
    }

    setLoadingId(identity);
    try {
      const convo = await createConversation(uid);
      router.push(`/${locale}${ROUTES.CHAT_CONVERSATION(convo.id)}`);
    } catch (err: unknown) {
      const maybe = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(maybe?.response?.data?.message ?? maybe?.message ?? 'Failed to create conversation.');
    } finally {
      setLoadingId(null);
    }
  }, [locale, router]);

  return (
    <>
      <aside
        className="flex min-h-0 w-[290px] shrink-0 flex-col sm:w-[310px]"
        style={{ background: '#1C2A2C', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="flex shrink-0 items-center justify-between px-3 py-2.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <p className="text-[12px] font-medium" style={{ color: 'var(--color-chat-text)' }}>Participants</p>
            <p className="mt-0.5 text-[10px]" style={{ color: 'rgba(251,245,221,0.35)' }}>
              {participants.length}
              {' '}
              in room
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
          {participants.map((p) => {
            const name = p.name || p.identity;
            const uid = parseUserId(p.identity);
            const canDm = !p.isLocal && uid !== null;

            return (
              <div
                key={p.identity}
                className="group flex items-center justify-between rounded-lg p-2 hover:bg-white/5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ background: colorFor(p.identity) }}
                  >
                    {initialsFor(name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-[var(--color-chat-text)]">
                      {name}
                      {p.isLocal && ' (You)'}
                    </p>
                    <p className="text-[10px]" style={{ color: 'rgba(251,245,221,0.35)' }}>
                      {p.isLocal ? 'You' : p.isSpeaking ? 'Speaking' : 'Participant'}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {raisedHands[p.identity] && <Hand size={13} style={{ color: '#E5B567' }} />}
                  {!p.isMicrophoneEnabled && <MicOff size={13} style={{ color: 'rgba(251,245,221,0.4)' }} />}
                  {!p.isCameraEnabled && <VideoOff size={13} style={{ color: 'rgba(251,245,221,0.4)' }} />}
                  {canDm && (
                    <button
                      type="button"
                      onClick={async () => openDm(p.identity)}
                      disabled={loadingId === p.identity}
                      className="ml-1 rounded-[6px] p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/10 disabled:opacity-50"
                      style={{ color: 'var(--color-chat-accent)' }}
                      title={`Message ${name}`}
                    >
                      {loadingId === p.identity ? <Loader2 size={13} className="animate-spin" /> : <MessageSquare size={13} />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}

export const PeopleSidebar = memo(PeopleSidebarImpl);
