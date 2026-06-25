'use client';

import { useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MessageSquare,
  Users,
  Settings,
  PhoneOff,
  Hand,
  Disc3,
  MoreHorizontal,
  Maximize2,
  Signal,
  Wifi,
} from 'lucide-react';
import Link from 'next/link';

/* ─── Mock participants ─── */
const PARTICIPANTS = [
  { id: 1, initials: 'AK', name: 'Alex K.', speaking: true, video: true, color: '#BA5A5A' },
  { id: 2, initials: 'SM', name: 'Sarah M.', speaking: false, video: true, color: '#B0BA99' },
  { id: 3, initials: 'JD', name: 'Jordan D.', speaking: false, video: false, color: '#8D7A7A' },
  { id: 4, initials: 'ME', name: 'You', speaking: false, video: true, color: '#9CC5A1', isYou: true },
];

/* ─── Chat messages ─── */
const CHAT_MSGS = [
  { id: 1, from: 'Alex K.', text: 'Can everyone see my screen?', ts: '10:42', initials: 'AK', color: '#BA5A5A' },
  { id: 2, from: 'Sarah M.', text: 'Yes! Looks great 👍', ts: '10:42', initials: 'SM', color: '#B0BA99' },
];

/* ─── Control button ─── */
function ControlBtn({
  icon: Icon,
  label,
  active = true,
  danger = false,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 group cursor-pointer"
      title={label}
    >
      <div
        className="w-11 h-11 rounded-[14px] flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-active:scale-95"
        style={{
          background: danger
            ? '#BA5A5A'
            : active
              ? 'rgba(255,255,255,0.15)'
              : 'rgba(255,255,255,0.07)',
          color: danger ? '#fff' : active ? '#FBF5DD' : 'rgba(251,245,221,0.45)',
        }}
      >
        <Icon size={18} />
      </div>
      <span
        className="text-[10px]"
        style={{ color: 'rgba(251,245,221,0.45)' }}
      >
        {label}
      </span>
    </button>
  );
}

/* ─── Video tile ─── */
function VideoTile({ p }: { p: (typeof PARTICIPANTS)[number] }) {
  return (
    <div
      className="rounded-[14px] flex items-center justify-center relative overflow-hidden aspect-video transition-all duration-200"
      style={{
        background: p.speaking ? 'rgba(156,197,161,0.1)' : '#1E2C2E',
        border: p.speaking ? '2px solid #9CC5A1' : '1px solid rgba(255,255,255,0.06)',
        boxShadow: p.speaking ? '0 0 0 1px rgba(156,197,161,0.3)' : 'none',
      }}
    >
      {/* Mock video content */}
      {p.video
        ? (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: `radial-gradient(ellipse at center, ${p.color}22 0%, #1a2627 100%)`,
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-lg"
              style={{ background: p.color }}
            >
              {p.initials}
            </div>
          </div>
        )
        : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ background: p.color }}
            >
              {p.initials}
            </div>
            <div
              className="px-2 py-0.5 rounded-full text-[10px]"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(251,245,221,0.5)' }}
            >
              Camera off
            </div>
          </div>
        )}

      {/* Name tag */}
      <div
        className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-[8px]"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      >
        {p.speaking && (
          <div className="flex gap-[2px] items-end">
            {[3, 5, 4].map((h, j) => (
              <div
                key={j}
                className="w-[2px] rounded-full"
                style={{ height: h, background: '#9CC5A1' }}
              />
            ))}
          </div>
        )}
        <span className="text-[11px] text-white/90 font-medium">
          {p.name}
          {p.isYou && ' (You)'}
        </span>
      </div>

      {/* Muted mic indicator */}
      {!p.speaking && (
        <div
          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <MicOff size={11} style={{ color: 'rgba(255,255,255,0.5)' }} />
        </div>
      )}
    </div>
  );
}

export default function MeetingPage() {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState(CHAT_MSGS);

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const ts = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
    setMessages(m => [...m, { id: Date.now(), from: 'You', text: chatInput, ts, initials: 'ME', color: '#9CC5A1' }]);
    setChatInput('');
  };

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: '#141E1F' }}
    >
      {/* ─── Header ─── */}
      <header
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div
              className="w-6 h-6 rounded-[7px] flex items-center justify-center text-white text-[11px] font-semibold"
              style={{ background: 'linear-gradient(135deg, #BA5A5A, #8A4040)' }}
            >
              R
            </div>
          </Link>
          <div
            className="w-px h-4"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          />
          <div>
            <p className="text-[13px] font-medium" style={{ color: '#FBF5DD' }}>
              Morning Standup
            </p>
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#9CC5A1' }}
              />
              <span className="text-[11px]" style={{ color: 'rgba(251,245,221,0.4)' }}>
                00:12:34
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Network quality */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px]"
            style={{ background: 'rgba(156,197,161,0.12)', color: '#9CC5A1' }}
          >
            <Wifi size={13} />
            <span className="text-[11px] font-medium">HD</span>
          </div>

          {/* Participant count */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px]"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(251,245,221,0.6)' }}
          >
            <Users size={13} />
            <span className="text-[11px]">{PARTICIPANTS.length}</span>
          </div>

          <button
            className="p-1.5 rounded-[8px] transition-all duration-200 hover:bg-white/10 cursor-pointer"
            style={{ color: 'rgba(251,245,221,0.5)' }}
          >
            <Maximize2 size={15} />
          </button>
          <button
            className="p-1.5 rounded-[8px] transition-all duration-200 hover:bg-white/10 cursor-pointer"
            style={{ color: 'rgba(251,245,221,0.5)' }}
          >
            <MoreHorizontal size={15} />
          </button>
        </div>
      </header>

      {/* ─── Body ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main stage */}
        <main className="flex-1 p-4 lg:p-6 flex flex-col gap-4 overflow-y-auto">
          {/* Video grid */}
          <div className={`grid gap-3 flex-1 ${PARTICIPANTS.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2'}`}>
            {PARTICIPANTS.map(p => (
              <VideoTile key={p.id} p={p} />
            ))}
          </div>

          {/* ── Floating Controls Dock ── */}
          <div className="flex items-center justify-center">
            <div
              className="flex items-center gap-3 px-5 py-3 rounded-[20px]"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0px 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <ControlBtn
                icon={micOn ? Mic : MicOff}
                label={micOn ? 'Mute' : 'Unmute'}
                active={micOn}
                onClick={() => setMicOn(v => !v)}
              />
              <ControlBtn
                icon={videoOn ? Video : VideoOff}
                label={videoOn ? 'Stop Video' : 'Start Video'}
                active={videoOn}
                onClick={() => setVideoOn(v => !v)}
              />

              <div className="w-px h-8 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

              <ControlBtn icon={MonitorUp} label="Share" />
              <ControlBtn icon={Disc3} label="Record" />
              <ControlBtn
                icon={Hand}
                label={handRaised ? 'Lower' : 'Raise'}
                active={!handRaised}
                onClick={() => setHandRaised(v => !v)}
              />

              <div className="w-px h-8 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

              <ControlBtn
                icon={MessageSquare}
                label="Chat"
                active={!chatOpen}
                onClick={() => setChatOpen(v => !v)}
              />
              <ControlBtn icon={Users} label="People" />
              <ControlBtn icon={Settings} label="Settings" />

              <div className="w-px h-8 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

              {/* Leave */}
              <Link href="/dashboard">
                <ControlBtn icon={PhoneOff} label="Leave" danger />
              </Link>
            </div>
          </div>
        </main>

        {/* ─── Chat panel ─── */}
        {chatOpen && (
          <aside
            className="w-72 flex flex-col shrink-0 animate-slide-in-right"
            style={{
              background: '#1C2A2C',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-[13px] font-medium" style={{ color: '#FBF5DD' }}>
                In-meeting Chat
              </p>
              <button
                onClick={() => setChatOpen(false)}
                className="p-1 rounded-[6px] hover:bg-white/10 cursor-pointer"
                style={{ color: 'rgba(251,245,221,0.4)' }}
              >
                <MicOff size={13} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
              {messages.map(m => (
                <div key={m.id} className="flex gap-2.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0 mt-0.5"
                    style={{ background: m.color }}
                  >
                    {m.initials}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[11px] font-semibold" style={{ color: m.color }}>
                        {m.from}
                      </span>
                      <span className="text-[10px]" style={{ color: 'rgba(251,245,221,0.3)' }}>
                        {m.ts}
                      </span>
                    </div>
                    <p className="text-[12px] leading-relaxed mt-0.5" style={{ color: '#FBF5DD' }}>
                      {m.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="p-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="flex items-center gap-2 rounded-[10px] px-3 py-2.5"
                style={{ background: '#273338' }}
              >
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="Send a message..."
                  className="flex-1 bg-transparent text-[12px] focus:outline-none placeholder:opacity-40"
                  style={{ color: '#FBF5DD' }}
                />
                <button
                  onClick={sendChat}
                  className="p-1 rounded-[6px] transition-all duration-200 cursor-pointer"
                  style={{ color: '#9CC5A1' }}
                >
                  <Signal size={12} />
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
