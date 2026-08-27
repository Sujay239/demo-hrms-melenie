import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check, Search } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value = [],
  onChange,
  placeholder = 'Select languages...',
  className,
  error = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleOption = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  };

  const removeOption = (optValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optValue));
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Trigger Control */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 transition-colors focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 shadow-xs cursor-pointer flex items-center justify-between gap-2 flex-wrap',
          error && 'border-rose-500 focus-within:ring-rose-500',
          isOpen && 'ring-2 ring-indigo-500 border-indigo-500'
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {value.length === 0 ? (
            <span className="text-slate-400 text-sm select-none">{placeholder}</span>
          ) : (
            value.map((val) => {
              const opt = options.find((o) => o.value === val);
              const label = opt ? opt.label : val;
              return (
                <span
                  key={val}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-200"
                >
                  {label}
                  <button
                    type="button"
                    onClick={(e) => removeOption(val, e)}
                    className="hover:text-indigo-900 focus:outline-none p-0.5 rounded hover:bg-indigo-100 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400 shrink-0">
          {value.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              className="text-xs text-slate-400 hover:text-slate-600 px-1 py-0.5"
              title="Clear all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl bg-white border border-slate-200 shadow-lg py-2 text-xs space-y-1 animate-in fade-in zoom-in-95">
          {/* Search Box */}
          <div className="px-2 pb-2 border-b border-slate-100">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search languages..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto px-1 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-3 text-center text-slate-400 italic">No matching languages found</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = value.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleOption(opt.value)}
                    className={cn(
                      'flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-colors',
                      isSelected
                        ? 'bg-indigo-50 text-indigo-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
