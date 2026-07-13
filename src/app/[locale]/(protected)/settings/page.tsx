'use client';

import {
  Bell,
  Camera,
  ChevronRight,
  Github,
  LogOut,
  Mail,
  Mic,
  Palette,
  Shield,
  SlidersHorizontal,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useCurrentUser } from '@/hooks/use-current-user';

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
      className="relative h-[22px] w-10 shrink-0 cursor-pointer rounded-full transition-all duration-200"
      style={{ background: checked ? 'var(--color-text-accent)' : 'var(--color-border)' }}
    >
      <span
        className="absolute top-[3px] left-[3px] size-4 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(0)' }}
      />
    </button>
  );
}

function Slider({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex w-full items-center gap-3">
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="h-1.5 flex-1 cursor-pointer rounded-full"
        style={{ accentColor: 'var(--color-text-accent)' }}
        aria-label={label}
      />
      <span className="w-9 text-right text-[12px] font-medium tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
        {value}
        %
      </span>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col gap-5 rounded-[14px] p-5"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0px 2px 8px rgba(0,0,0,0.04)' }}
    >
      <p className="text-[13px] font-semibold tracking-wider uppercase" style={{ color: 'var(--color-text-secondary)' }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[14px] font-medium" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
        {description && <span className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>{description}</span>}
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
    <div className="min-h-dvh" style={{ background: 'var(--color-bg)' }}>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Settings</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Manage your account, preferences, and workspace.</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-48 shrink-0">
            <div
              className="sticky top-6 flex flex-col gap-0.5 rounded-[14px] p-2"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              {SECTIONS.map(sec => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-150"
                  style={{
                    background: activeSection === sec.id ? 'var(--color-surface-hover)' : 'transparent',
                    color: activeSection === sec.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  }}
                >
                  <sec.icon size={15} />
                  {sec.label}
                </button>
              ))}
              <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                <button
                  onClick={logout}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-150 hover:bg-red-50"
                  style={{ color: 'var(--color-text-accent)' }}
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="animate-fade-up flex flex-1 flex-col gap-4">
            {activeSection === 'profile' && (
              <>
                <SectionCard title="Profile">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div
                        className="flex size-16 items-center justify-center rounded-full text-xl font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg, #BA5A5A 0%, #8A4040 100%)' }}
                      >
                        {initials}
                      </div>
                      <button
                        className="absolute -right-1 -bottom-1 flex size-6 cursor-pointer items-center justify-center rounded-full"
                        style={{ background: 'var(--color-text-primary)', color: '#fff' }}
                        title="Change avatar"
                      >
                        <Camera size={11} />
                      </button>
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>{user?.name}</p>
                      <p className="mt-0.5 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-primary)' }}>Display Name</label>
                      <input
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        className="h-9 w-full rounded-[10px] px-3 text-[13px] focus:outline-none"
                        style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                        placeholder="Your display name"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-medium" style={{ color: 'var(--color-text-primary)' }}>Email</label>
                      <div
                        className="flex h-9 w-full items-center gap-2 rounded-[10px] px-3 text-[13px]"
                        style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                      >
                        <Mail size={13} />
                        {user?.email}
                      </div>
                    </div>
                    <button
                      className="cursor-pointer self-start rounded-[10px] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #BA5A5A 0%, #8A4040 100%)' }}
                    >
                      Save Changes
                    </button>
                  </div>
                </SectionCard>
                <SectionCard title="Connected Accounts">
                  <Row label="GitHub" description="OAuth login via GitHub">
                    <button
                      className="flex cursor-pointer items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-medium hover:opacity-80"
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
                  <span className="text-[14px] font-medium" style={{ color: 'var(--color-text-primary)' }}>Microphone Volume</span>
                  <Slider value={micVolume} onChange={setMicVolume} label="Microphone volume" />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[14px] font-medium" style={{ color: 'var(--color-text-primary)' }}>Speaker Volume</span>
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
                      className="group flex cursor-pointer flex-col items-center gap-2"
                    >
                      <div
                        className="aspect-square w-full rounded-[12px] transition-all duration-200 group-hover:scale-105"
                        style={{
                          background: t.color,
                          border: selectedTheme === t.key ? '2px solid var(--color-text-accent)' : '2px solid transparent',
                          boxShadow: selectedTheme === t.key ? '0 0 0 2px rgba(186,90,90,0.3)' : 'none',
                        }}
                      />
                      <span className="text-[11px] font-medium" style={{ color: selectedTheme === t.key ? 'var(--color-text-accent)' : 'var(--color-text-secondary)' }}>
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
                  <span className="text-[14px] font-medium" style={{ color: 'var(--color-text-primary)' }}>Bandwidth Limit</span>
                  <Slider value={bandwidth} onChange={setBandwidth} label="Bandwidth" />
                </div>
              </SectionCard>
            )}

            {activeSection === 'security' && (
              <SectionCard title="Security">
                <Row label="Session Management" description="View and revoke active sessions">
                  <button
                    className="flex cursor-pointer items-center gap-1 rounded-[8px] px-3 py-1.5 text-[12px] font-medium hover:bg-[var(--color-surface-hover)]"
                    style={{ color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
                    onClick={() => router.push('/settings/security')}
                  >
                    Manage
                    {' '}
                    <ChevronRight size={12} />
                  </button>
                </Row>
                <div className="pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <button
                    onClick={logout}
                    className="flex cursor-pointer items-center gap-2 rounded-[10px] px-4 py-2 text-[13px] font-medium hover:opacity-80"
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
