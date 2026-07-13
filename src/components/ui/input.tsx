import * as React from 'react';
import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-[10px]',
        'border border-[#D5E3CC] bg-[#F3F8EF]',
        'px-3 py-2 text-sm text-[#2C3E2D]',
        'placeholder:text-[#8D7A7A]/55',
        'transition-all duration-200',
        'focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[#B0BA99] focus-visible:ring-offset-0 focus-visible:outline-none',
        'hover:border-[#B0BA99]/70',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
