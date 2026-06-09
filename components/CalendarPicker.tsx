"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarPickerProps {
  /** Current date string in YYYY-MM-DD format */
  value: string;
  /** Called with YYYY-MM-DD string or "" when cleared */
  onChange: (dateStr: string) => void;
  /** Label shown above the input */
  label?: string;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Language for day headers and button labels */
  language?: "id" | "en";
  /** Whether the dropdown opens upward */
  openUpward?: boolean;
  /** Optional helper text below the input */
  helperText?: string;
}

/**
 * Premium custom calendar date picker.
 * Replaces native <input type="date"> with a modern dropdown calendar.
 * Used in Register and Profile pages.
 */
export default function CalendarPicker({
  value,
  onChange,
  label,
  placeholder,
  language = "id",
  openUpward = false,
  helperText,
}: CalendarPickerProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date>(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  const dateLocale = language === "en" ? "en-US" : "id-ID";

  const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const selectDate = (day: number) => {
    const newDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
    const yyyy = newDate.getFullYear();
    const mm = String(newDate.getMonth() + 1).padStart(2, "0");
    const dd = String(newDate.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setShowDropdown(false);
  };

  const isSelectedDate = (day: number) => {
    if (!value) return false;
    const ld = new Date(value);
    return (
      ld.getDate() === day &&
      ld.getMonth() === calendarDate.getMonth() &&
      ld.getFullYear() === calendarDate.getFullYear()
    );
  };

  const displayText = value
    ? new Date(value).toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const dayHeaders =
    language === "en"
      ? ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
      : ["Mg", "Sn", "Sl", "Rb", "Km", "Jm", "Sb"];

  const positionClasses = openUpward
    ? "bottom-[calc(100%+0.5rem)] left-0 sm:left-auto sm:right-0"
    : "top-[calc(100%+0.5rem)] right-0 sm:left-auto sm:right-0";

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-left focus:outline-none focus:border-primary transition-all hover:border-slate-300 dark:hover:border-slate-700"
        >
          <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
          {displayText ? (
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {displayText}
            </span>
          ) : (
            <span className="text-sm text-slate-400">
              {placeholder || (language === "en" ? "Select date..." : "Pilih tanggal...")}
            </span>
          )}
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-[90]"
              onClick={() => setShowDropdown(false)}
            />
            <div
              className={`absolute ${positionClasses} w-[calc(100vw-2rem)] sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-[100] p-4 animate-in fade-in slide-in-from-top-2`}
              style={{ maxWidth: "320px" }}
            >
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() =>
                    setCalendarDate(
                      new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1)
                    )
                  }
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {calendarDate.toLocaleDateString(dateLocale, {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCalendarDate(
                      new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1)
                    )
                  }
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {dayHeaders.map((d) => (
                  <div key={d} className="text-xs font-bold text-slate-400">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {blanksArray.map((b) => (
                  <div key={`blank-${b}`} className="h-8" />
                ))}
                {daysArray.map((day) => {
                  const isSelected = isSelectedDate(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => selectDate(day)}
                      className={`h-8 w-full flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Clear button */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setShowDropdown(false);
                  }}
                  className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                >
                  {language === "en" ? "Clear Date" : "Hapus Tanggal"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {helperText && (
        <p className="text-xs text-slate-400">{helperText}</p>
      )}
    </div>
  );
}
