"use client";
import { useEffect, useRef, useState } from "react";
import { DayPicker, DateRange as DayPickerRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  DateRange,
  Preset,
  getPresetRange,
  formatRangeLabel,
} from "@/lib/dateRange";

const PRESETS: { label: string; value: Preset }[] = [
  { label: "This Week", value: "this-week" },
  { label: "This Month", value: "this-month" },
  { label: "Last 30 Days", value: "last-30" },
  { label: "All Time", value: "all-time" },
];

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export default function DateRangePicker({
  value,
  onChange,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<Preset>("this-month");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function selectPreset(preset: Preset) {
    setActivePreset(preset);
    onChange(getPresetRange(preset));
    if (preset !== "all-time") setOpen(false); // keep open only for custom
  }

  function handleDayPickerSelect(range: DayPickerRange | undefined) {
    if (!range?.from) return;
    setActivePreset("this-month"); // clear preset label for custom ranges
    onChange({ from: range.from, to: range.to ?? range.from });
    if (range.from && range.to) setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-gray-300
                   dark:border-gray-600 bg-white dark:bg-gray-800
                   px-3 py-1.5 text-sm font-medium text-gray-700
                   dark:text-gray-300 shadow-sm hover:bg-gray-50
                   dark:hover:bg-gray-700 focus:outline-none
                   focus:ring-2 focus:ring-blue-500"
      >
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2
               2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        {formatRangeLabel(value)}
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-2 rounded-xl border
                     border-gray-200 dark:border-gray-700 bg-white
                     dark:bg-gray-800 shadow-xl"
        >
          {/* Preset buttons */}
          <div
            className="flex gap-1 border-b border-gray-200
                          dark:border-gray-700 p-2"
          >
            {PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => selectPreset(p.value)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors
                  ${
                    activePreset === p.value
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Calendar */}
          <DayPicker
            mode="range"
            selected={
              value.from
                ? { from: value.from, to: value.to ?? undefined }
                : undefined
            }
            onSelect={handleDayPickerSelect}
            numberOfMonths={1}
            className="p-2"
          />
        </div>
      )}
    </div>
  );
}
