/**
 * Base modal component with overlay and backdrop
 */
'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';

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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) {
      return;
    }
    // Native modality provides focus containment, background inertness and focus return.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className={`m-auto ${sizeMap[size]} max-h-[90dvh] overflow-y-auto rounded-[16px] border-0 p-0 shadow-lg backdrop:bg-black/50`}
      style={{ width: 'calc(100% - 2rem)', background: 'var(--color-chat-bg)', color: 'var(--color-chat-text)' }}
      onCancel={(event) => {
        event.preventDefault();
        // Preserve the existing behavior: Escape does not dismiss while editing a field.
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
          return;
        }
        onClose();
      }}
      onPointerDown={(event) => {
        if (event.target !== event.currentTarget) {
          return;
        }
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
          onClose();
        }
      }}
    >
      <div
        className="flex w-full flex-col"
        style={{ background: 'var(--color-chat-bg)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <h2 id={titleId} className="text-lg font-semibold" style={{ color: 'var(--color-chat-text)' }}>
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="rounded-[8px] p-1.5 transition-all duration-200 hover:bg-white/10"
            style={{ color: 'rgba(251,245,221,0.4)' }}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </dialog>
  );
}
