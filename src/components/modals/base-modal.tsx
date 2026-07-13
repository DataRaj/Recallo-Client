/**
 * Base modal component with overlay and backdrop
 */
'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useEffect } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
};

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
        style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`w-full ${sizeMap[size]} flex max-h-[90vh] flex-col rounded-[16px] shadow-lg`}
          style={{ background: 'var(--color-chat-bg)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b px-6 py-4"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-chat-text)' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-[8px] p-1.5 transition-all duration-200 hover:bg-white/10"
              style={{ color: 'rgba(251,245,221,0.4)' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
