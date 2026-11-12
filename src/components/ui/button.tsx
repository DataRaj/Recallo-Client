import type { VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium',
    'transition-all duration-200 select-none cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.97]',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'rounded-[6px] bg-[var(--color-brand)] text-[var(--color-brand-ink)] hover:bg-[#f36b4d]',
        primary:
          'rounded-[6px] bg-[var(--color-brand)] text-[var(--color-brand-ink)] hover:bg-[#f36b4d]',
        outline:
          'rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]',
        ghost:
          'rounded-[6px] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]',
        muted:
          'rounded-[6px] bg-[var(--color-accent)]/15 text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/25',
        destructive:
          'rounded-[6px] bg-[var(--color-action)] text-white shadow-[0px_1px_3px_rgba(186,90,90,0.25)] hover:bg-[#892819]',
        link:
          'h-auto rounded-none p-0 text-[var(--color-text-accent)] underline-offset-4 hover:underline',
      },
      size: {
        'default': 'h-10 px-4 py-2',
        'sm': 'h-8 rounded-[6px] px-3 text-xs',
        'lg': 'h-12 rounded-[6px] px-6 text-base',
        'xl': 'h-14 rounded-[6px] px-8 text-base',
        'icon': 'size-10 rounded-[6px]',
        'icon-sm': 'size-8 rounded-[6px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type ButtonProps = React.ComponentProps<'button'>
  & VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    gradient?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  gradient = false,
  style,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  const gradientStyle
    = gradient
      ? {
          background: 'var(--color-brand)',
          color: 'var(--color-brand-ink)',
          ...style,
        }
      : style;

  return (
    <Comp
      className={cn(buttonVariants({ variant: variant ?? (gradient ? 'primary' : undefined), size, className }))}
      style={gradientStyle}
      {...props}
    />
  );
}

export { Button, buttonVariants };
