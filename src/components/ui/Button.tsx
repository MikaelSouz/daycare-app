import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-[0.98]',
      secondary: 'bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-800/50 active:scale-[0.98]',
      outline: 'border border-border-light dark:border-border-dark bg-transparent hover:bg-surface-light dark:hover:bg-surface-dark active:scale-[0.98]',
      ghost: 'bg-transparent hover:bg-surface-light dark:hover:bg-surface-dark',
      danger: 'bg-danger text-white hover:opacity-90 active:scale-[0.98]',
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs',
      md: 'h-12 px-6 text-sm font-bold',
      lg: 'h-14 px-8 text-base font-bold',
      icon: 'h-12 w-12 flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          children
        )}
      </button>
    );
  }
);
