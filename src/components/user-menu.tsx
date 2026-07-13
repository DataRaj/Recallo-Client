'use client';

import { ChevronDown, LogOut, Palette, Settings } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useCurrentUser } from '@/hooks/use-current-user';

export function UserMenu() {
  const { user, isHydrated } = useCurrentUser();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Not hydrated yet — show skeleton
  if (!isHydrated) {
    return <div className="h-9 w-[140px]" />;
  }

  // Not logged in — show auth buttons
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="hidden rounded-[10px] px-4 py-2 text-sm font-medium hover:bg-[#DDEBD5] sm:block"
          style={{ color: '#2C3E2D' }}
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="rounded-[10px] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #BA5A5A 0%, #8A4040 100%)',
            boxShadow: '0px 2px 8px rgba(186,90,90,0.3)',
          }}
        >
          Try Now
        </Link>
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const menuItems = [
    // { label: 'Profile', icon: User, href: '/settings/profile' },
    { label: 'Settings', icon: Settings, href: '/settings' },
    { label: 'Appearance', icon: Palette, href: '/settings#appearance' },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex cursor-pointer items-center gap-2 rounded-[12px] px-2.5 py-1.5 transition-all duration-200 hover:bg-[#DDEBD5]"
        style={{ color: '#2C3E2D' }}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {/* Avatar */}
        <div
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{
            background: 'linear-gradient(135deg, #BA5A5A 0%, #8A4040 100%)',
          }}
        >
          {initials}
        </div>
        <span className="hidden max-w-[100px] truncate text-sm font-medium sm:block">
          {user.name.split(' ')[0]}
        </span>
        <ChevronDown
          size={13}
          className="shrink-0 transition-transform duration-200"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            color: '#8D7A7A',
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="animate-slide-down absolute top-full right-0 z-50 mt-2 w-52 rounded-[14px] py-1.5"
          style={{
            background: '#F3F8EF',
            border: '1px solid #D5E3CC',
            boxShadow:
              '0px 12px 32px rgba(0,0,0,0.08), 0px 1px 0px rgba(255,255,255,0.8) inset',
          }}
        >
          {/* User info */}
          <div
            className="mb-1 px-3.5 py-2.5"
            style={{ borderBottom: '1px solid #D5E3CC' }}
          >
            <p
              className="truncate text-[13px] font-semibold"
              style={{ color: '#2C3E2D' }}
            >
              {user.name}
            </p>
            <p
              className="mt-0.5 truncate text-[11px]"
              style={{ color: '#8D7A7A' }}
            >
              {user.email}
            </p>
          </div>

          {/* Links */}
          {menuItems.map(item => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="mx-1 flex items-center gap-2.5 rounded-[8px] px-3.5 py-2 text-[13px] font-medium transition-all duration-150 hover:bg-[#DDEBD5]"
              style={{ color: '#2C3E2D' }}
            >
              <item.icon size={14} style={{ color: '#8D7A7A' }} />
              {item.label}
            </Link>
          ))}

          {/* Divider + logout */}
          <div
            className="mx-3 my-1.5"
            style={{ height: 1, background: '#D5E3CC' }}
          />
          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="mx-1 flex w-full cursor-pointer items-center gap-2.5 rounded-[8px] px-3.5 py-2 text-[13px] font-medium transition-all duration-150 hover:bg-red-50"
            style={{ color: '#BA5A5A', width: 'calc(100% - 8px)' }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
