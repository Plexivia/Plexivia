import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_BN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Shadcn-styled DatePicker component with calendar popover,
 * month/year navigation, and keyboard/date selection.
 */
export function DatePicker({
  value = '', // Expects YYYY-MM-DD
  onChange,
  required = false,
  disabled = false,
  className = '',
  placeholder,
  id,
  name
}) {
  const { t, i18n } = useTranslation();
  const defaultPlaceholder = placeholder || t('common.selectDate', 'Select Date');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial date or default to current date
  const parseDate = (str) => {
    if (!str) return null;
    const [y, m, d] = str.split('-').map(Number);
    if (!y || !m || !d) return null;
    const date = new Date(y, m - 1, d);
    return isNaN(date.getTime()) ? null : date;
  };

  const selectedDate = parseDate(value);
  const initialViewDate = selectedDate || new Date();

  const [viewYear, setViewYear] = useState(initialViewDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialViewDate.getMonth());

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Update view when value changes externally
  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [value]);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleDateSelect = (day) => {
    const monthStr = String(viewMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const isoDate = `${viewYear}-${monthStr}-${dayStr}`;
    onChange && onChange(isoDate);
    setIsOpen(false);
  };

  const handleTodaySelect = (e) => {
    e.stopPropagation();
    const today = new Date();
    const isoDate = today.toISOString().split('T')[0];
    onChange && onChange(isoDate);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange && onChange('');
  };

  // Calendar Grid Calculation
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const isToday = (day) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === viewMonth &&
      today.getFullYear() === viewYear
    );
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getFullYear() === viewYear
    );
  };

  // Format display string
  const formatDisplay = (isoStr) => {
    if (!isoStr) return '';
    const date = parseDate(isoStr);
    if (!date) return isoStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button / Input Display */}
      <button
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 bg-background border rounded-md text-xs transition-all cursor-pointer select-none ${
          isOpen ? 'ring-1 ring-primary border-primary' : 'border-border hover:border-border/80'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className={`font-mono ${value ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
            {value ? formatDisplay(value) : defaultPlaceholder}
          </span>
        </div>

        {value && !disabled && (
          <span
            onClick={handleClear}
            className="p-0.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            title="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {/* Hidden native input for form submissions */}
      <input
        type="hidden"
        name={name}
        value={value}
        required={required}
      />

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 p-3 bg-popover text-popover-foreground border border-border rounded-lg shadow-xl animate-in fade-in-0 zoom-in-95 duration-100 min-w-[260px] max-w-[280px]">
          {/* Header Month / Year controls */}
          <div className="flex items-center justify-between gap-1 mb-2.5 pb-2 border-b border-border">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <span>{i18n.language === 'bn' ? MONTH_NAMES_BN[viewMonth] : MONTH_NAMES[viewMonth]}</span>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent border border-border/60 rounded px-1 py-0.5 text-xs font-bold font-mono outline-none cursor-pointer"
              >
                {Array.from({ length: 40 }, (_, i) => 2000 + i).map((y) => (
                  <option key={y} value={y} className="bg-popover text-foreground">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAYS_SHORT.map((day) => (
              <span key={day} className="text-[10px] font-bold text-muted-foreground">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Previous Month trailing days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => {
              const day = daysInPrevMonth - firstDayOfWeek + i + 1;
              return (
                <span
                  key={`prev-${i}`}
                  className="p-1 text-[11px] text-muted-foreground/30 font-mono select-none"
                >
                  {day}
                </span>
              );
            })}

            {/* Current Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const active = isSelected(day);
              const today = isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={`h-7 w-7 mx-auto rounded-md flex items-center justify-center font-mono font-medium text-xs transition-all cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : today
                      ? 'border border-emerald-500 text-emerald-600 font-bold hover:bg-emerald-50'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick Actions Footer */}
          <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={handleTodaySelect}
              className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              {t('common.today', 'Today')}
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground font-semibold cursor-pointer"
            >
              {t('common.close', 'Close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
