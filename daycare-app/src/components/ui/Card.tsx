import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({ children, className, onClick }: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden',
        onClick && 'cursor-pointer active:scale-[0.99] transition-transform',
        className
      )}
    >
      {children}
    </div>
  );
};
