import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'h-10 w-full rounded-xl border border-border bg-secondary px-4 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-[#00e5c3]/60 focus:ring-1 focus:ring-[#00e5c3]/30',
          className
        )}
        {...props}
      />
    );
  }
);