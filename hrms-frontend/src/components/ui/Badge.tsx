import React from 'react';
import { cn } from '@/utils/cn';
import { STATUS_SEMANTICS } from '@/design-system/tokens';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: keyof typeof STATUS_SEMANTICS;
  variant?: 'neutral' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  status,
  variant = 'neutral',
  size = 'md',
  showDot = true,
  children,
  ...props
}) => {
  if (status && STATUS_SEMANTICS[status]) {
    const config = STATUS_SEMANTICS[status];
    return (
      <span
        className={cn(
          'inline-flex items-center font-medium rounded-full border px-2.5 py-0.5 text-xs',
          config.bg,
          config.text,
          config.border,
          size === 'sm' && 'px-2 py-0 text-[11px]',
          className
        )}
        {...props}
      >
        {showDot && <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', config.dot)} />}
        {children || config.label}
      </span>
    );
  }

  const variantStyles = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    sky: 'bg-sky-50 text-sky-700 border-sky-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border px-2.5 py-0.5 text-xs',
        variantStyles[variant],
        size === 'sm' && 'px-2 py-0 text-[11px]',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
