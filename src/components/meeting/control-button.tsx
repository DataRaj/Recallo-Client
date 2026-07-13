'use client';

import { Loader2 } from 'lucide-react';

type ControlButtonProps = {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
  busy?: boolean;
  comingSoon?: boolean;
  onClick?: () => void;
};

export function ControlButton({
  icon: Icon,
  label,
  active = true,
  danger = false,
  disabled = false,
  busy = false,
  comingSoon = false,
  onClick,
}: ControlButtonProps) {
  const isDisabled = disabled || comingSoon || busy;

  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className="group flex shrink-0 flex-col items-center gap-1 disabled:cursor-not-allowed"
      title={comingSoon ? `${label} — coming soon` : label}
      type="button"
    >
      <div
        className="flex size-10 items-center justify-center rounded-[12px] transition-all duration-200 group-enabled:group-hover:scale-105 group-enabled:group-active:scale-95"
        style={{
          background: danger
            ? 'var(--color-text-accent)'
            : active && !comingSoon
              ? 'rgba(255,255,255,0.15)'
              : 'rgba(255,255,255,0.07)',
          color: danger
            ? '#fff'
            : active && !comingSoon
              ? 'var(--color-chat-text)'
              : 'rgba(251,245,221,0.45)',
          opacity: comingSoon ? 0.55 : 1,
        }}
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Icon size={17} />}
      </div>
      <span className="text-[9px] leading-none" style={{ color: 'rgba(251,245,221,0.45)' }}>
        {label}
      </span>
    </button>
  );
}
