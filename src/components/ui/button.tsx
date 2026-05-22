import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'bg-gradient-to-r from-[#00e5c3] to-[#00b4d8] text-[#0a0e17] shadow-glow hover:brightness-110',
  secondary: 'bg-tertiary text-foreground hover:bg-slate-700',
  ghost: 'bg-transparent text-foreground hover:bg-white/5',
  danger: 'bg-danger text-white hover:opacity-90'
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base'
};

export function Button({ className, variant = 'default', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}