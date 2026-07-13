import type { VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium',
    'transition-all duration-200 select-none cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B0BA99] focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.97]',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'rounded-[10px] bg-[#2C3E2D] text-white shadow-[0px_1px_3px_rgba(0,0,0,0.1)] hover:bg-[#3a4f3b]',
        primary:
          'rounded-[10px] text-white shadow-[0px_1px_3px_rgba(186,90,90,0.25)] hover:opacity-90',
        outline:
          'rounded-[10px] border border-[#D5E3CC] bg-[#F3F8EF] text-[#2C3E2D] hover:bg-[#DDEBD5]',
        ghost:
          'rounded-[10px] text-[#2C3E2D] hover:bg-[#DDEBD5]',
        muted:
          'rounded-[10px] bg-[#B0BA99]/15 text-[#2C3E2D] hover:bg-[#B0BA99]/25',
        destructive:
          'rounded-[10px] bg-[#BA5A5A] text-white shadow-[0px_1px_3px_rgba(186,90,90,0.25)] hover:bg-[#a34f4f]',
        link:
          'h-auto rounded-none p-0 text-[#BA5A5A] underline-offset-4 hover:underline',
      },
      size: {
        'default': 'h-10 px-4 py-2',
        'sm': 'h-8 rounded-[8px] px-3 text-xs',
        'lg': 'h-12 rounded-[12px] px-6 text-base',
        'xl': 'h-14 rounded-[14px] px-8 text-base',
        'icon': 'size-10 rounded-[10px]',
        'icon-sm': 'size-8 rounded-[8px]',
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
    = gradient || variant === 'primary'
      ? {
          background: 'linear-gradient(135deg, #BA5A5A, #8A4040)',
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
