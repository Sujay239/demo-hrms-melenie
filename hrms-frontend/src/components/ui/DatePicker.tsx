import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Calendar } from './Calendar';
import { cn } from '@/utils/cn';

export interface DatePickerProps {
  value?: string; // Format: 'YYYY-MM-DD'
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  fromYear?: number;
  toYear?: number;
  placement?: 'auto' | 'top' | 'bottom';
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  minDate,
  maxDate,
  fromYear,
  toYear,
  placement = 'auto',
  className,
  id,
  name,
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openAbove, setOpenAbove] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-detect whether to open above or below based on viewport & container space
  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && containerRef.current) {
      if (placement === 'top') {
        setOpenAbove(true);
      } else if (placement === 'bottom') {
        setOpenAbove(false);
      } else {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        // If less than 350px below trigger, or closer to bottom of window/modal, flip above
        setOpenAbove(spaceBelow < 350 || rect.top > spaceBelow);
      }
    }
    setIsOpen(!isOpen);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Format date for display
  const formatDisplayDate = (val?: string) => {
    if (!val) return '';
    try {
      const parts = val.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        }
      }
    } catch {
      // fallback
    }
    return val;
  };

  const handleSelectDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;
    onChange?.(formatted);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Hidden input for HTML form submission */}
      <input
        type="hidden"
        id={id}
        name={name}
        value={value || ''}
        required={required}
      />

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-left shadow-xs transition-all cursor-pointer',
          'hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6900]/20 focus:border-[#FF6900]',
          isOpen && 'ring-2 ring-[#FF6900]/20 border-[#FF6900]',
          disabled && 'opacity-60 bg-slate-50 cursor-not-allowed'
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
          <span className={cn('truncate font-medium', !value ? 'text-slate-400' : 'text-slate-800')}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </div>

        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
            title="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </button>

      {/* Popover Card containing Shadcn Calendar */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-[9999] w-[290px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150',
            openAbove ? 'bottom-full mb-2' : 'top-full mt-1.5',
            'left-0 sm:left-auto sm:right-0 md:left-0'
          )}
        >
          <Calendar
            selected={value}
            onSelect={handleSelectDate}
            minDate={minDate}
            maxDate={maxDate}
            fromYear={fromYear}
            toYear={toYear}
            disabled={disabled}
          />
          <div className="w-full px-3 py-2 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                handleSelectDate(now);
              }}
              className="text-[11px] font-bold text-[#FF6900] hover:text-[#E05D00] px-2 py-1 rounded hover:bg-orange-50 cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-200/60 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
