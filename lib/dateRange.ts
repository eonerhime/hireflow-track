import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  format,
} from "date-fns";

export type DateRange = { from: Date; to: Date } | { from: null; to: null };

export type Preset = "this-week" | "this-month" | "last-30" | "all-time";

export function getPresetRange(preset: Preset): DateRange {
  const now = new Date();
  switch (preset) {
    case "this-week":
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case "this-month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "last-30":
      return { from: subDays(now, 30), to: now };
    case "all-time":
      return { from: null, to: null };
  }
}

export function formatRangeLabel(range: DateRange): string {
  if (!range.from) return "All Time";
  return `${format(range.from, "MMM d")} – ${format(range.to!, "MMM d, yyyy")}`;
}

export function rangeToParams(range: DateRange): {
  from?: string;
  to?: string;
} {
  if (!range.from) return {};
  return {
    from: range.from.toISOString(),
    to: range.to!.toISOString(),
  };
}

export type PresetKey = Preset;
