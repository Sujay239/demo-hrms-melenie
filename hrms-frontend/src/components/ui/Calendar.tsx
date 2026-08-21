import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface CalendarProps {
  selected?: Date | string | null;
  onSelect?: (date: Date) => void;
  minDate?: Date | string;
  maxDate?: Date | string;
  className?: string;
  disabled?: boolean;
  fromYear?: number;
  toYear?: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const Calendar: React.FC<CalendarProps> = ({
  selected,
  onSelect,
  minDate,
  maxDate,
  className,
  disabled = false,
  fromYear = 1930,
  toYear = 2050,
}) => {
  const parseDate = (d?: Date | string | null): Date | null => {
    if (!d) return null;
    if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
    const parts = d.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const selectedDate = parseDate(selected);
  const minDateTime = parseDate(minDate)?.getTime();
  const maxDateTime = parseDate(maxDate)?.getTime();

  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    return selectedDate ? selectedDate.getMonth() : new Date().getMonth();
  });

  const [currentYear, setCurrentYear] = useState<number>(() => {
    return selectedDate ? selectedDate.getFullYear() : new Date().getFullYear();
  });

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(selectedDate.getMonth());
      setCurrentYear(selectedDate.getFullYear());
    }
  }, [selected]);

  const yearsList = useMemo(() => {
    const years: number[] = [];
    for (let y = toYear; y >= fromYear; y--) {
      years.push(y);
    }
    return years;
  }, [fromYear, toYear]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

  const today = new Date();
  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    );
  };

  const isDayDisabled = (day: number) => {
    if (disabled) return true;
    const targetTime = new Date(currentYear, currentMonth, day).getTime();
    if (minDateTime && targetTime < minDateTime) return true;
    if (maxDateTime && targetTime > maxDateTime) return true;
    return false;
  };

  const handleDateClick = (day: number) => {
    if (isDayDisabled(day)) return;
    const newDate = new Date(currentYear, currentMonth, day);
    onSelect?.(newDate);
  };

  return (
    <div className={cn('p-3 bg-white select-none w-full', className)}>
      {/* Header Month / Year Dropdowns & Navigation */}
      <div className="flex items-center justify-between gap-1 pb-2.5 border-b border-slate-100 mb-2">
        <div className="flex items-center gap-1.5">
          {/* Quick Month Select Dropdown */}
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10))}
            className="text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border-none rounded-lg px-2 py-1 cursor-pointer focus:ring-2 focus:ring-[#FF6900]/30 outline-none transition-colors"
          >
            {MONTH_NAMES.map((m, idx) => (
              <option key={m} value={idx}>
                {m}
              </option>
            ))}
          </select>

          {/* Quick Year Select Dropdown (From 1930 to 2050) */}
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
            className="text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border-none rounded-lg px-2 py-1 cursor-pointer focus:ring-2 focus:ring-[#FF6900]/30 outline-none transition-colors"
          >
            {yearsList.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        {/* Previous / Next Month Arrows */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {WEEK_DAYS.map((wd) => (
          <div
            key={wd}
            className="text-[11px] font-semibold text-slate-400 py-0.5"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Grid of days */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {/* Previous Month trailing days */}
        {Array.from({ length: firstDay }).map((_, i) => {
          const dayNum = prevMonthDays - firstDay + i + 1;
          return (
            <div
              key={`prev-${i}`}
              className="h-8 w-8 mx-auto flex items-center justify-center text-slate-300 text-[11px] rounded-lg"
            >
              {dayNum}
            </div>
          );
        })}

        {/* Current Month days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const selected = isSelected(day);
          const current = isToday(day);
          const isBlocked = isDayDisabled(day);

          return (
            <button
              key={`day-${day}`}
              type="button"
              disabled={isBlocked}
              onClick={() => handleDateClick(day)}
              className={cn(
                'h-8 w-8 mx-auto flex items-center justify-center rounded-lg font-medium transition-all text-xs cursor-pointer',
                selected
                  ? 'bg-[#FF6900] text-white font-bold shadow-xs hover:bg-[#E05D00]'
                  : current
                  ? 'border border-[#FF6900] text-[#FF6900] font-bold hover:bg-orange-50'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
                isBlocked && 'opacity-25 cursor-not-allowed hover:bg-transparent'
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
