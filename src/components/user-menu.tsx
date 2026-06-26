'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useAuth } from '@/hooks/use-auth';
import {
  User,
  Settings,
  Palette,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export function UserMenu() {
  const { user, isHydrated } = useCurrentUser();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Not hydrated yet — show skeleton
  if (!isHydrated) return <div className="w-[140px] h-9" />;

  // Not logged in — show auth buttons
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="hidden sm:block px-4 py-2 rounded-[10px] text-sm font-medium hover:bg-[#DDEBD5]"
          style={{ color: '#2C3E2D' }}
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 rounded-[10px] text-sm font-medium text-white hover:opacity-90"
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
    { label: 'Profile', icon: User, href: '/settings/profile' },
    { label: 'Settings', icon: Settings, href: '/settings' },
    { label: 'Appearance', icon: Palette, href: '/settings#appearance' },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-[12px] transition-all duration-200 hover:bg-[#DDEBD5] cursor-pointer"
        style={{ color: '#2C3E2D' }}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
          style={{ background: 'linear-gradient(135deg, #BA5A5A 0%, #8A4040 100%)' }}
        >
          {initials}
        </div>
        <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">
          {user.name.split(' ')[0]}
        </span>
        <ChevronDown
          size={13}
          className="shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: '#8D7A7A' }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-52 rounded-[14px] py-1.5 z-50 animate-slide-down"
          style={{
            background: '#F3F8EF',
            border: '1px solid #D5E3CC',
            boxShadow: '0px 12px 32px rgba(0,0,0,0.08), 0px 1px 0px rgba(255,255,255,0.8) inset',
          }}
        >
          {/* User info */}
          <div
            className="px-3.5 py-2.5 mb-1"
            style={{ borderBottom: '1px solid #D5E3CC' }}
          >
            <p className="text-[13px] font-semibold truncate" style={{ color: '#2C3E2D' }}>
              {user.name}
            </p>
            <p className="text-[11px] truncate mt-0.5" style={{ color: '#8D7A7A' }}>
              {user.email}
            </p>
          </div>

          {/* Links */}
          {menuItems.map(item => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium transition-all duration-150 hover:bg-[#DDEBD5] mx-1 rounded-[8px]"
              style={{ color: '#2C3E2D' }}
            >
              <item.icon size={14} style={{ color: '#8D7A7A' }} />
              {item.label}
            </Link>
          ))}

          {/* Divider + logout */}
          <div className="my-1.5 mx-3" style={{ height: 1, background: '#D5E3CC' }} />
          <button
            onClick={() => { setOpen(false); logout(); }}
            className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium w-full transition-all duration-150 hover:bg-red-50 mx-1 rounded-[8px] cursor-pointer"
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
