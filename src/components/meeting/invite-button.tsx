'use client';

import { Check, Link2 } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { toast } from 'sonner';

type InviteButtonProps = {
  /** Locale-less route path, e.g. ROUTES.MEETING_DETAIL(id) → "/meeting/123". */
  path: string;
};

function buildShareUrl(path: string): string {
  if (typeof window === 'undefined') {
    return path;
  }
  const seg = window.location.pathname.split('/')[1] ?? '';
  const localePrefix = /^[a-z]{2}(-[a-z]{2})?$/i.test(seg) ? `/${seg}` : '';
  return `${window.location.origin}${localePrefix}${path}`;
}

function InviteButtonImpl({ path }: InviteButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const url = buildShareUrl(path);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Invite link copied');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (insecure context / permissions) — show the
      // URL so the user can copy it manually.
      toast.error('Copy failed', { description: url });
    }
  }, [path]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy invite link"
      className="flex items-center gap-1.5 rounded-[8px] px-2 py-1 transition-all hover:bg-white/10"
      style={{ background: 'rgba(255,255,255,0.06)', color: copied ? '#9CC5A1' : 'rgba(251,245,221,0.6)' }}
    >
      {copied ? <Check size={12} /> : <Link2 size={12} />}
      <span className="hidden text-[10px] font-medium sm:inline">{copied ? 'Copied' : 'Invite'}</span>
    </button>
  );
}

export const InviteButton = memo(InviteButtonImpl);
