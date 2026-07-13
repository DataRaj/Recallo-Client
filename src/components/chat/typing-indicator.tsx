/**
 * Typing indicator component
 */
'use client';

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-2">
      <div
        className="flex items-center gap-1.5 px-3.5 py-3"
        style={{ background: 'var(--color-chat-bubble)', borderRadius: '14px 14px 14px 4px' }}
      >
        {[0, 0.2, 0.4].map((delay, i) => (
          <span
            key={i}
            className="inline-block size-1.5 rounded-full"
            style={{
              background: 'var(--color-chat-accent)',
              opacity: 0.7,
              animation: `recallo-pulse-dot 1.4s ${delay}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
