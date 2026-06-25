'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import {
  User, Bell, Shield, Palette, Mic, SlidersHorizontal, LogOut, Github,
  ChevronRight, Camera, Mail,
} from 'lucide-react';

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'audio-video', label: 'Audio & Video', icon: Mic },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'bandwidth', label: 'Quality & Bandwidth', icon: SlidersHorizontal },
  { id: 'security', label: 'Security', icon: Shield },
];

const CHAT_THEMES = [
  { key: 'default', label: 'Sage', color: '#273338' },
  { key: 'midnight', label: 'Midnight', color: '#161A1D' },
  { key: 'forest', label: 'Forest', color: '#1F2D24' },
  { key: 'ocean', label: 'Ocean', color: '#17252A' },
  { key: 'lavender', label: 'Lavender', color: '#25213A' },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative w-10 h-[22px] rounded-full transition-all duration-200 cursor-pointer shrink-0"
      style={{ background: checked ? '#BA5A5A' : '#D5E3CC' }}
    >
      <span
        className="absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm"
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(0)' }}
      />
    </button>
  );
}

function Slider({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex items-center gap-3 w-full">
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 rounded-full cursor-pointer"
        style={{ accentColor: '#BA5A5A' }}
        aria-label={label}
      />
      <span className="text-[12px] font-medium tabular-nums w-9 text-right" style={{ color: '#8D7A7A' }}>
        {value}%
      </span>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-[14px] p-5 flex flex-col gap-5"
      style={{ background: '#F3F8EF', border: '1px solid #D5E3CC', boxShadow: '0px 2px 8px rgba(0,0,0,0.04)' }}
    >
      <p className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: '#8D7A7A' }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-[14px] font-medium" style={{ color: '#2C3E2D' }}>{label}</span>
        {description && <span className="text-[12px]" style={{ color: '#8D7A7A' }}>{description}</span>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useCurrentUser();
  const { logout } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('profile');
  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [noiseCancellation, setNoiseCancellation] = useState(true);
  const [micVolume, setMicVolume] = useState(80);
  const [speakerVolume, setSpeakerVolume] = useState(75);
  const [meetingReminders, setMeetingReminders] = useState(true);
  const [dmNotifications, setDmNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [hd, setHd] = useState(true);
  const [bandwidth, setBandwidth] = useState(70);

  const initials = user?.name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  return (
    <div className="min-h-dvh" style={{ background: '#E6F2DD' }}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#2C3E2D' }}>Settings</h1>
          <p className="text-sm mt-1" style={{ color: '#8D7A7A' }}>Manage your account, preferences, and workspace.</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-48 shrink-0">
            <div
              className="rounded-[14px] p-2 flex flex-col gap-0.5 sticky top-6"
              style={{ background: '#F3F8EF', border: '1px solid #D5E3CC' }}
            >
              {SECTIONS.map(sec => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13px] font-medium w-full text-left transition-all duration-150 cursor-pointer"
                  style={{
                    background: activeSection === sec.id ? '#DDEBD5' : 'transparent',
                    color: activeSection === sec.id ? '#2C3E2D' : '#8D7A7A',
                  }}
                >
                  <sec.icon size={15} />
                  {sec.label}
                </button>
              ))}
              <div className="mt-2 pt-2" style={{ borderTop: '1px solid #D5E3CC' }}>
                <button
                  onClick={logout}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13px] font-medium w-full text-left transition-all duration-150 hover:bg-red-50 cursor-pointer"
                  style={{ color: '#BA5A5A' }}
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 flex flex-col gap-4 animate-fade-up">
            {activeSection === 'profile' && (
              <>
                <SectionCard title="Profile">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold"
                        style={{ background: 'linear-gradient(135deg, #BA5A5A 0%, #8A4040 100%)' }}
                      >
                        {initials}
                      </div>
                      <button
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                        style={{ background: '#2C3E2D', color: '#fff' }}
                        title="Change avatar"
                      >
                        <Camera size={11} />
                      </button>
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold" style={{ color: '#2C3E2D' }}>{user?.name}</p>
                      <p className="text-[12px] mt-0.5" style={{ color: '#8D7A7A' }}>{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium" style={{ color: '#2C3E2D' }}>Display Name</label>
                      <input
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        className="w-full h-9 rounded-[10px] px-3 text-[13px] focus:outline-none"
                        style={{ background: '#E6F2DD', border: '1px solid #D5E3CC', color: '#2C3E2D' }}
                        placeholder="Your display name"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium" style={{ color: '#2C3E2D' }}>Email</label>
                      <div
                        className="w-full h-9 rounded-[10px] px-3 flex items-center gap-2 text-[13px]"
                        style={{ background: '#E6F2DD', border: '1px solid #D5E3CC', color: '#8D7A7A' }}
                      >
                        <Mail size={13} />
                        {user?.email}
                      </div>
                    </div>
                    <button
                      className="self-start px-4 py-2 rounded-[10px] text-[13px] font-medium text-white hover:opacity-90 cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #BA5A5A 0%, #8A4040 100%)' }}
                    >
                      Save Changes
                    </button>
                  </div>
                </SectionCard>
                <SectionCard title="Connected Accounts">
                  <Row label="GitHub" description="OAuth login via GitHub">
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium hover:opacity-80 cursor-pointer"
                      style={{ background: '#18181b', color: '#fff' }}
                    >
                      <Github size={13} />
                      Connected
                    </button>
                  </Row>
                </SectionCard>
              </>
            )}

            {activeSection === 'audio-video' && (
              <SectionCard title="Audio & Video">
                <Row label="Microphone" description="Enable microphone by default when joining">
                  <Toggle checked={micEnabled} onChange={setMicEnabled} />
                </Row>
                <Row label="Camera" description="Enable camera by default when joining">
                  <Toggle checked={cameraEnabled} onChange={setCameraEnabled} />
                </Row>
                <Row label="Noise Cancellation" description="AI-powered background noise suppression">
                  <Toggle checked={noiseCancellation} onChange={setNoiseCancellation} />
                </Row>
                <div className="flex flex-col gap-2">
                  <span className="text-[14px] font-medium" style={{ color: '#2C3E2D' }}>Microphone Volume</span>
                  <Slider value={micVolume} onChange={setMicVolume} label="Microphone volume" />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[14px] font-medium" style={{ color: '#2C3E2D' }}>Speaker Volume</span>
                  <Slider value={speakerVolume} onChange={setSpeakerVolume} label="Speaker volume" />
                </div>
              </SectionCard>
            )}

            {activeSection === 'notifications' && (
              <SectionCard title="Notifications">
                <Row label="Meeting Reminders" description="Get notified 5 minutes before meetings">
                  <Toggle checked={meetingReminders} onChange={setMeetingReminders} />
                </Row>
                <Row label="Direct Messages" description="Show notifications for new DMs">
                  <Toggle checked={dmNotifications} onChange={setDmNotifications} />
                </Row>
                <Row label="Sound Effects" description="Play sounds for join/leave events">
                  <Toggle checked={soundEffects} onChange={setSoundEffects} />
                </Row>
                <Row label="Email Notifications" description="Receive meeting summaries by email">
                  <Toggle checked={emailNotifications} onChange={setEmailNotifications} />
                </Row>
              </SectionCard>
            )}

            {activeSection === 'appearance' && (
              <SectionCard title="Chat Theme">
                <div className="grid grid-cols-5 gap-3">
                  {CHAT_THEMES.map(t => (
                    <button
                      key={t.key}
                      onClick={() => setSelectedTheme(t.key)}
                      className="flex flex-col items-center gap-2 cursor-pointer group"
                    >
                      <div
                        className="w-full aspect-square rounded-[12px] transition-all duration-200 group-hover:scale-105"
                        style={{
                          background: t.color,
                          border: selectedTheme === t.key ? '2px solid #BA5A5A' : '2px solid transparent',
                          boxShadow: selectedTheme === t.key ? '0 0 0 2px rgba(186,90,90,0.3)' : 'none',
                        }}
                      />
                      <span className="text-[11px] font-medium" style={{ color: selectedTheme === t.key ? '#BA5A5A' : '#8D7A7A' }}>
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              </SectionCard>
            )}

            {activeSection === 'bandwidth' && (
              <SectionCard title="Quality & Bandwidth">
                <Row label="HD Video" description="Enable 1080p video quality">
                  <Toggle checked={hd} onChange={setHd} />
                </Row>
                <div className="flex flex-col gap-2">
                  <span className="text-[14px] font-medium" style={{ color: '#2C3E2D' }}>Bandwidth Limit</span>
                  <Slider value={bandwidth} onChange={setBandwidth} label="Bandwidth" />
                </div>
              </SectionCard>
            )}

            {activeSection === 'security' && (
              <SectionCard title="Security">
                <Row label="Session Management" description="View and revoke active sessions">
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 rounded-[8px] text-[12px] font-medium hover:bg-[#DDEBD5] cursor-pointer"
                    style={{ color: '#2C3E2D', border: '1px solid #D5E3CC' }}
                    onClick={() => router.push('/settings/security')}
                  >
                    Manage <ChevronRight size={12} />
                  </button>
                </Row>
                <div className="pt-2" style={{ borderTop: '1px solid #D5E3CC' }}>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-medium hover:opacity-80 cursor-pointer"
                    style={{ background: 'rgba(186,90,90,0.1)', color: '#BA5A5A', border: '1px solid rgba(186,90,90,0.2)' }}
                  >
                    <LogOut size={14} />
                    Sign out of all devices
                  </button>
                </div>
              </SectionCard>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
