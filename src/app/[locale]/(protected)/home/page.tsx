'use client';

import type { RecentRoom } from '@/utils/recent-rooms';
import { ArrowRight, FileText, MessageSquare, Plus, Video } from 'lucide-react';
import { useModal } from '@/components/providers/modal-provider';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRecentRooms } from '@/hooks/use-recent-rooms';
import { ROUTES } from '@/lib/routes';
import { Link } from '@/libs/i18n-navigation';

function RoomRow({ room }: { room: RecentRoom }) {
  const date = new Date(room.at);
  const validDate = Number.isFinite(date.getTime());
  return (
    <Link
      href={room.type === 'webinar' ? ROUTES.WEBINAR_DETAIL(room.id) : ROUTES.MEETING_DETAIL(room.id)}
      className="app-room-row group"
    >
      <Video size={18} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold">{room.title || `Room ${room.id}`}</h3>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          {room.role === 'host' ? 'Hosted' : 'Joined'}
          {' '}
          ·
          {room.type === 'webinar' ? 'Webinar' : 'Meeting'}
        </p>
      </div>
      <time className="hidden text-xs text-[var(--color-text-secondary)] sm:block" dateTime={validDate ? date.toISOString() : undefined}>
        {validDate ? date.toLocaleDateString() : 'Date unavailable'}
      </time>
      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
    </Link>
  );
}

export default function HomePage() {
  const { user } = useCurrentUser();
  const { openModal } = useModal();
  const recentRooms = useRecentRooms();
  const userName = user?.name.split(' ')[0] ?? 'there';

  return (
    <div className="app-workspace">
      <header className="app-page-heading">
        <p className="app-eyebrow">Your workspace</p>
        <h1>
          {`Hello, ${userName}.`}
        </h1>
        <p>A place for the next conversation, and the details you come back for.</p>
      </header>

      <section className="app-start-panel" aria-labelledby="start-heading">
        <div>
          <span className="app-eyebrow">01 / Get together</span>
          <h2 id="start-heading">Make room for a conversation.</h2>
          <p>Create a room or join with an invitation. Check your camera and microphone before entering.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" onClick={() => openModal('create-room')}>
            <Video size={17} />
            Create a room
          </Button>
          <Button size="lg" variant="outline" onClick={() => openModal('join-room')}>
            <Plus size={17} />
            Join a meeting
          </Button>
        </div>
      </section>

      <div className="app-workspace-columns">
        <section className="min-w-0" aria-labelledby="recent-heading">
          <div className="app-section-heading">
            <h2 id="recent-heading">Recent conversations</h2>
            <Link href={ROUTES.MEETINGS} className="app-text-link">
              All meetings
              <ArrowRight size={14} />
            </Link>
          </div>
          <p className="mb-5 text-xs text-[var(--color-text-secondary)]">Rooms opened in this browser.</p>
          <div className="app-surface">
            {recentRooms.length > 0
              ? recentRooms.slice(0, 8).map(room => <RoomRow key={room.id} room={room} />)
              : (
                  <div className="app-empty-state">
                    <Video size={26} aria-hidden="true" />
                    <h3>Your first conversation starts here.</h3>
                    <p>Rooms you create or join in this browser will appear here.</p>
                    <button type="button" className="app-text-link" onClick={() => openModal('create-room')}>
                      Create a room
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
          </div>
        </section>
        <aside className="app-context-panel" aria-labelledby="context-heading">
          <span className="app-eyebrow">02 / Keep the context</span>
          <FileText size={24} aria-hidden="true" />
          <h2 id="context-heading">Return to what was said.</h2>
          <p>Open a past meeting to check for a transcript, summary and follow-up actions when insights are available.</p>
          <Link href={ROUTES.MEETINGS} className="app-text-link">
            Browse meetings
            <ArrowRight size={14} />
          </Link>
          <div className="app-context-divider" />
          <MessageSquare size={20} aria-hidden="true" />
          <h3>Continue the conversation.</h3>
          <Link href={ROUTES.CHATS} className="app-text-link">
            Open chats
            <ArrowRight size={14} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
