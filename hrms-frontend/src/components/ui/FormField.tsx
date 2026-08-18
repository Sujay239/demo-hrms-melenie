import React from 'react';
import { cn } from '@/utils/cn';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  helperText,
  error,
  className,
  children,
}) => {
  return (
    <div className={cn('flex flex-col space-y-1.5 w-full', className)}>
      {label && (
        <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500 font-semibold">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-rose-600 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};
