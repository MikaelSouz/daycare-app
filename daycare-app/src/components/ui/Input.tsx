import React from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon: Icon, error, containerClassName, className, ...props }, ref) => {
    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <label className="text-sm font-semibold text-text-light dark:text-text-dark ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {Icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted-light dark:text-text-muted-dark group-focus-within:text-primary transition-colors">
              <Icon size={20} />
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "block w-full py-3 bg-surface-light dark:bg-surface-dark border-none rounded-xl text-sm ring-1 ring-border-light dark:ring-border-dark focus:ring-2 focus:ring-primary text-text-light dark:text-text-dark placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark transition-all outline-none",
              Icon ? "pl-10 pr-4" : "px-4",
              error && "ring-danger focus:ring-danger",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-danger ml-1 font-medium">{error}</p>
        )}
      </div>
    );
  }
);
