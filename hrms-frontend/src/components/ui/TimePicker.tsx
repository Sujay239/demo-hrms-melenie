import React, { useState, useRef, useEffect } from 'react';
import { Clock, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface TimePickerProps {
  value?: string; // Format: '09:00 AM' or '09:00' or '18:00'
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

// Quick Preset Times
const QUICK_PRESETS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '12:00 PM',
  '01:00 PM',
  '05:00 PM',
  '06:00 PM',
  '10:00 PM',
];

const parseTimeString = (valStr?: string) => {
  if (!valStr) return { hour12: 9, min: 0, period: 'AM' as 'AM' | 'PM' };

  const isPM = /pm/i.test(valStr);
  const isAM = /am/i.test(valStr);
  const clean = valStr.replace(/[^0-9:]/g, '');
  const parts = clean.split(':').map(Number);
  let h = parts[0] ?? 9;
  const m = parts[1] ?? 0;

  let period: 'AM' | 'PM' = 'AM';
  if (isPM) {
    period = 'PM';
  } else if (isAM) {
    period = 'AM';
  } else {
    // 24-hour format handling
    if (h >= 12) {
      period = 'PM';
      if (h > 12) h -= 12;
    } else {
      period = 'AM';
      if (h === 0) h = 12;
    }
  }

  let hour12 = h;
  if (hour12 > 12) hour12 = hour12 % 12 || 12;
  if (hour12 === 0) hour12 = 12;

  return { hour12, min: Math.min(59, Math.max(0, m)), period };
};

const formatTime12 = (h12: number, min: number, period: 'AM' | 'PM') => {
  const hStr = String(h12).padStart(2, '0');
  const mStr = String(min).padStart(2, '0');
  return `${hStr}:${mStr} ${period}`;
};

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select time',
  disabled = false,
  className,
  id,
  name,
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsed = parseTimeString(value);
  const [selectedHour, setSelectedHour] = useState(parsed.hour12);
  const [selectedMin, setSelectedMin] = useState(parsed.min);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(parsed.period);

  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; openAbove: boolean }>({
    top: 0,
    left: 0,
    openAbove: false,
  });

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openAbove = spaceBelow < 330 && rect.top > 330;
      setPopoverPos({
        top: openAbove ? rect.top : rect.bottom,
        left: Math.max(12, Math.min(rect.left, window.innerWidth - 300)),
        openAbove,
      });
    }
    setIsOpen(!isOpen);
  };

  // Sync internal state when external value changes
  useEffect(() => {
    const p = parseTimeString(value);
    setSelectedHour(p.hour12);
    setSelectedMin(p.min);
    setSelectedPeriod(p.period);
  }, [value]);

  // Close when clicking outside or scrolling
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleResize = () => setIsOpen(false);

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('resize', handleResize);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const emitTimeChange = (h: number, m: number, p: 'AM' | 'PM') => {
    setSelectedHour(h);
    setSelectedMin(m);
    setSelectedPeriod(p);
    const formatted = formatTime12(h, m, p);
    onChange?.(formatted);
  };

  const handleSelectPreset = (preset: string) => {
    const p = parseTimeString(preset);
    emitTimeChange(p.hour12, p.min, p.period);
    setIsOpen(false);
  };

  const hoursList = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutesList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const displayTime = value ? formatTime12(parsed.hour12, parsed.min, parsed.period) : placeholder;

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <input type="hidden" id={id} name={name} value={value || ''} required={required} />

      {/* Interactive Trigger Control */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleToggle();
          }
        }}
        className={cn(
          'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-left shadow-xs transition-all cursor-pointer select-none',
          'hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
          isOpen && 'ring-2 ring-indigo-500/20 border-indigo-500',
          disabled && 'opacity-60 bg-slate-50 cursor-not-allowed'
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className={cn('truncate font-semibold', !value ? 'text-slate-400' : 'text-slate-900')}>
            {displayTime}
          </span>
        </div>
        <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform', isOpen && 'rotate-180')} />
      </div>

      {/* Popover Clock & Wheel Selector */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            left: `${popoverPos.left}px`,
            ...(popoverPos.openAbove
              ? { bottom: `${window.innerHeight - popoverPos.top + 6}px` }
              : { top: `${popoverPos.top + 6}px` }),
            zIndex: 999999,
          }}
          className="w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-3.5 space-y-3"
        >
          {/* Header Display & AM/PM Toggle */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Selected Time</span>
              <strong className="text-lg font-black text-indigo-900">
                {formatTime12(selectedHour, selectedMin, selectedPeriod)}
              </strong>
            </div>

            {/* AM / PM Segmented Switcher */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => emitTimeChange(selectedHour, selectedMin, 'AM')}
                className={cn(
                  'px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
                  selectedPeriod === 'AM'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => emitTimeChange(selectedHour, selectedMin, 'PM')}
                className={cn(
                  'px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
                  selectedPeriod === 'PM'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                PM
              </button>
            </div>
          </div>

          {/* Hours & Minutes Selectors */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Hours Column */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Hour</span>
              <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200/80">
                {hoursList.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => emitTimeChange(h, selectedMin, selectedPeriod)}
                    className={cn(
                      'h-8 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center',
                      selectedHour === h
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-700 bg-white hover:bg-indigo-50 hover:text-indigo-600'
                    )}
                  >
                    {String(h).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes Column */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Minute</span>
              <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200/80">
                {minutesList.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => emitTimeChange(selectedHour, m, selectedPeriod)}
                    className={cn(
                      'h-8 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center',
                      selectedMin === m
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-700 bg-white hover:bg-indigo-50 hover:text-indigo-600'
                    )}
                  >
                    {String(m).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Quick Presets</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {QUICK_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg transition-colors cursor-pointer border border-slate-200/60"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Done Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Done & Apply Time
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
