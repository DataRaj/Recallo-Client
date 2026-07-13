import * as React from 'react';
import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-[10px]',
        'border border-[var(--color-border)] bg-[var(--color-surface)]',
        'px-3 py-2 text-sm text-[var(--color-text-primary)]',
        'placeholder:text-[var(--color-text-secondary)]/55',
        'transition-all duration-200',
        'focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-0 focus-visible:outline-none',
        'hover:border-[var(--color-accent)]/70',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
