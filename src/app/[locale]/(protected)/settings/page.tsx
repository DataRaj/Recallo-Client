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
import { StateTransition } from '@/components/animations/state-transition';
import { CHAT_THEMES, useTheme } from '@/components/providers/theme-provider';
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

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-label={label}
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
        {description != null && description !== '' && <span className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>{description}</span>}
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
  const { chatTheme, setChatTheme } = useTheme();
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

        <div className="flex flex-col gap-6 md:flex-row">
          {/* Sidebar */}
          <aside className="w-full shrink-0 md:w-48">
            <div
              className="sticky top-6 grid grid-cols-2 gap-0.5 rounded-[12px] p-2 md:flex md:flex-col"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              {SECTIONS.map(sec => (
                <button
                  key={sec.id}
                  aria-pressed={activeSection === sec.id}
                  aria-controls="settings-panel"
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
                  onClick={() => void logout()}
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
          <div id="settings-panel" className="min-w-0 flex-1">
            <StateTransition stateKey={activeSection} className="flex flex-col gap-4">
              {activeSection === 'profile' && (
                <>
                  <SectionCard title="Profile">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <div
                          className="flex size-16 items-center justify-center rounded-full text-xl font-semibold text-white"
                          style={{ background: 'var(--color-action)' }}
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
                        <label htmlFor="display-name" className="text-[12px] font-medium" style={{ color: 'var(--color-text-primary)' }}>Display Name</label>
                        <input
                          id="display-name"
                          value={displayName}
                          onChange={e => setDisplayName(e.target.value)}
                          className="h-9 w-full rounded-[10px] px-3 text-[13px] focus:outline-none"
                          style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                          placeholder="Your display name"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[12px] font-medium" style={{ color: 'var(--color-text-primary)' }}>Email</span>
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
                        style={{ background: 'var(--color-action)' }}
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
                    <Toggle label="Microphone" checked={micEnabled} onChange={setMicEnabled} />
                  </Row>
                  <Row label="Camera" description="Enable camera by default when joining">
                    <Toggle label="Camera" checked={cameraEnabled} onChange={setCameraEnabled} />
                  </Row>
                  <Row label="Noise Cancellation" description="AI-powered background noise suppression">
                    <Toggle label="Noise cancellation" checked={noiseCancellation} onChange={setNoiseCancellation} />
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
                    <Toggle label="Meeting reminders" checked={meetingReminders} onChange={setMeetingReminders} />
                  </Row>
                  <Row label="Direct Messages" description="Show notifications for new DMs">
                    <Toggle label="Direct messages" checked={dmNotifications} onChange={setDmNotifications} />
                  </Row>
                  <Row label="Sound Effects" description="Play sounds for join/leave events">
                    <Toggle label="Sound effects" checked={soundEffects} onChange={setSoundEffects} />
                  </Row>
                  <Row label="Email Notifications" description="Receive meeting summaries by email">
                    <Toggle label="Email notifications" checked={emailNotifications} onChange={setEmailNotifications} />
                  </Row>
                </SectionCard>
              )}

              {activeSection === 'appearance' && (
                <SectionCard title="Chat Theme">
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {Object.entries(CHAT_THEMES).map(([key, t]) => (
                      <button
                        key={key}
                        aria-pressed={chatTheme === key}
                        onClick={() => setChatTheme(key as keyof typeof CHAT_THEMES)}
                        className="group flex cursor-pointer flex-col items-center gap-2"
                      >
                        <div
                          className="aspect-square w-full rounded-[12px] transition-all duration-200 group-hover:scale-105"
                          style={{
                            background: t.swatch,
                            border: chatTheme === key ? '2px solid var(--color-text-accent)' : '2px solid transparent',
                            boxShadow: chatTheme === key ? '0 0 0 2px var(--color-text-primary)' : 'none',
                          }}
                        />
                        <span className="text-[11px] font-medium" style={{ color: chatTheme === key ? 'var(--color-text-accent)' : 'var(--color-text-secondary)' }}>
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
                    <Toggle label="HD video" checked={hd} onChange={setHd} />
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
                      onClick={() => void logout()}
                      className="flex cursor-pointer items-center gap-2 rounded-[10px] px-4 py-2 text-[13px] font-medium hover:opacity-80"
                      style={{ background: 'rgba(186,90,90,0.1)', color: 'var(--color-action)', border: '1px solid rgba(186,90,90,0.2)' }}
                    >
                      <LogOut size={14} />
                      Sign out of all devices
                    </button>
                  </div>
                </SectionCard>
              )}
            </StateTransition>
          </div>
        </div>
      </div>
    </div>
  );
}
