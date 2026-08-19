import React from 'react';
import { cn } from '@/utils/cn';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
  id?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  className,
  id,
}) => {
  const isSm = size === 'sm';

  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
          isSm ? 'h-5 w-9' : 'h-6 w-11',
          checked ? 'bg-emerald-500' : 'bg-slate-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
            isSm ? 'h-4 w-4' : 'h-5 w-5',
            checked ? (isSm ? 'translate-x-4' : 'translate-x-5') : 'translate-x-0'
          )}
        />
      </button>
      {label && (
        <span
          onClick={() => !disabled && onChange(!checked)}
          className={cn(
            'text-xs font-semibold cursor-pointer transition-colors',
            checked ? 'text-emerald-700' : 'text-slate-400',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
};
