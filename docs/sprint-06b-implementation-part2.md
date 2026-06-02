# HireFlow — Sprint 6B Implementation Guide (Part 2 of 2)

**Document Type:** Developer Implementation Reference
**Sprint:** 6B — UI/UX Upgrade
**Branch:** `feature/sprint-06b-ui-upgrade` (from `develop`)
**Covers:** PBI-049 (Notification Bell), PBI-050 (Date Range Filter), PBI-051 (Dashboard Restructure)

> **Read Part 1 first.** This document assumes PBI-047 (dark mode) and PBI-048 (activity log) are complete and all tests are passing.

---

## PBI-049 — Notification Bell

**Goal:** A bell icon in the top bar that shows a badge count of overdue reminders, opens a dropdown of due/overdue items on click, and links through to the full reminders page. No new model or API route — consumes the existing `GET /api/reminders`.

### Step 1 — Create NotificationBell component

`components/NotificationBell.tsx`:

```typescript
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Reminder {
  id: string;
  company: string;
  role: string;
  stage: string;
  followUpAt: string;
}

export default function NotificationBell() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/reminders")
      .then((r) => r.json())
      .then(setReminders)
      .catch(() => setReminders([]));
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const overdueCount = reminders.filter(
    (r) => new Date(r.followUpAt) < new Date(new Date().toDateString())
  ).length;

  const preview = reminders.slice(0, 5);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications — ${overdueCount} overdue`}
        className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100
                   dark:text-gray-400 dark:hover:bg-gray-800
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {/* Bell icon */}
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24"
             stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002
               6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6
               8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6
               0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {overdueCount > 0 && (
          <span
            aria-label={`${overdueCount} overdue reminders`}
            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center
                       justify-center rounded-full bg-red-500 text-[10px]
                       font-bold text-white"
          >
            {overdueCount > 9 ? "9+" : overdueCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl
                     border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-800 shadow-lg
                     focus:outline-none"
          role="menu"
        >
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Reminders
            </p>
            {overdueCount > 0 && (
              <p className="text-xs text-red-500 mt-0.5">
                {overdueCount} overdue
              </p>
            )}
          </div>

          {preview.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500
                          dark:text-gray-400">
              No upcoming reminders
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {preview.map((r) => {
                const overdue =
                  new Date(r.followUpAt) <
                  new Date(new Date().toDateString());
                return (
                  <li key={r.id}>
                    <Link
                      href={`/dashboard/applications/${r.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-start justify-between gap-2 px-4 py-3
                                 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium
                                      text-gray-900 dark:text-gray-100">
                          {r.role}
                        </p>
                        <p className="truncate text-xs text-gray-500
                                      dark:text-gray-400">
                          {r.company}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-xs font-medium ${
                          overdue
                            ? "text-red-500"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {formatDistanceToNow(new Date(r.followUpAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
            <Link
              href="/dashboard/reminders"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-blue-600 dark:text-blue-400
                         hover:underline"
            >
              View all reminders →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Step 2 — Add to dashboard layout top bar

In your dashboard layout (`app/dashboard/layout.tsx` or the top bar component):

```typescript
import NotificationBell from "@/components/NotificationBell";
import ThemeToggle from "@/components/ThemeToggle";

// In the top bar JSX, right-aligned:
<div className="flex items-center gap-2">
  <ThemeToggle />
  <NotificationBell />
</div>
```

### Step 3 — Tests

`__tests__/NotificationBell.test.tsx`:

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NotificationBell from "@/components/NotificationBell";

const futureDate = new Date(Date.now() + 86400000).toISOString();
const pastDate = new Date(Date.now() - 86400000).toISOString();

function mockFetch(reminders: object[]) {
  global.fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve(reminders),
  }) as jest.Mock;
}

describe("NotificationBell", () => {
  afterEach(() => jest.restoreAllMocks());

  it("renders without a badge when no reminders are overdue", async () => {
    mockFetch([
      { id: "1", company: "Acme", role: "Engineer",
        stage: "APPLIED", followUpAt: futureDate },
    ]);
    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.queryByLabelText(/overdue reminders/i)).not.toBeInTheDocument();
    });
  });

  it("shows correct badge count when overdue reminders exist", async () => {
    mockFetch([
      { id: "1", company: "Acme", role: "Engineer",
        stage: "APPLIED", followUpAt: pastDate },
      { id: "2", company: "BetaCo", role: "PM",
        stage: "INTERVIEW", followUpAt: pastDate },
    ]);
    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByLabelText(/2 overdue reminders/i)).toBeInTheDocument();
    });
  });

  it("opens dropdown with reminder items when bell is clicked", async () => {
    mockFetch([
      { id: "1", company: "Acme Corp", role: "Senior Engineer",
        stage: "APPLIED", followUpAt: futureDate },
    ]);
    render(<NotificationBell />);
    await waitFor(() => screen.getByRole("button"));
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    });
  });
});
```

### DoD check

| Confirmed | How                                                             | Item                        |
| --------- | --------------------------------------------------------------- | --------------------------- |
| [x]       | Bell renders with no badge when all reminders are future        | Badge hidden correctly      |
| [x]       | Bell shows red badge with correct count for overdue items       | Badge count correct         |
| [x]       | Click bell → dropdown opens with reminder list                  | Dropdown works              |
| [x]       | Click outside dropdown → dropdown closes                        | Outside-click dismiss works |
| [x]       | "View all reminders →" link navigates to `/dashboard/reminders` | Link correct                |
| [x]       | Dark mode: badge, bell, and dropdown all styled correctly       | Dark mode correct           |
| [x]       | `npm test` — NotificationBell.test.tsx passes (3 tests)         | Tests passing               |
| [x]       | `npm run build` — no errors                                     | Build clean                 |

---

## PBI-050 — Dashboard Date Range Filter

**Goal:** A `DateRangePicker` component in the dashboard top bar that filters all dashboard data (metrics, reminders, activity) to a selected date range. Presets: This Week, This Month, Last 30 Days, All Time.

### Step 1 — Install packages

```bash
npm install react-day-picker@8.10.1 date-fns@3.6.0 --legacy-peer-deps
```

### Step 2 — Date range utilities

`lib/dateRange.ts`:

```typescript
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
```

### Step 3 — Create DateRangePicker component

`components/DateRangePicker.tsx`:

```typescript
"use client";
import { useEffect, useRef, useState } from "react";
import { DayPicker, DateRange as DayPickerRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  DateRange, Preset, getPresetRange, formatRangeLabel,
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

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
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
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24"
             stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2
               2 0 00-2 2v12a2 2 0 002 2z" />
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
          <div className="flex gap-1 border-b border-gray-200
                          dark:border-gray-700 p-2">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => selectPreset(p.value)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors
                  ${activePreset === p.value
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
```

### Step 4 — Extend dashboard API routes to accept date params

**`GET /api/dashboard/metrics`** — add optional `from`/`to` query params:

```typescript
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateFilter =
    from && to ? { appliedAt: { gte: new Date(from), lte: new Date(to) } } : {};

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id, deletedAt: null, ...dateFilter },
    // ... rest of query
  });
  // ... rest of handler
}
```

Apply the same `dateFilter` pattern to `GET /api/reminders` (filter on `followUpAt`) and `GET /api/activity` (filter on `createdAt`).

### Step 5 — Wire DateRangePicker to dashboard client

In `app/dashboard/page.tsx` (make it a client component or extract a `DashboardClient` that already exists):

```typescript
"use client";
import { useState } from "react";
import DateRangePicker from "@/components/DateRangePicker";
import { getPresetRange, rangeToParams, DateRange } from "@/lib/dateRange";
import useSWR from "swr"; // if already installed; otherwise use useEffect + fetch

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function DashboardClient() {
  const [range, setRange] = useState<DateRange>(getPresetRange("this-month"));

  const params = new URLSearchParams(rangeToParams(range));
  const queryString = params.toString() ? `?${params}` : "";

  const { data: metrics } = useSWR(`/api/dashboard/metrics${queryString}`, fetcher);
  const { data: activity } = useSWR(`/api/activity${queryString}`, fetcher);
  const { data: reminders } = useSWR(`/api/reminders${queryString}`, fetcher);

  return (
    <>
      <DateRangePicker value={range} onChange={setRange} />
      {/* pass metrics, activity, reminders to child components */}
    </>
  );
}
```

> **SWR note:** If `swr` is not already installed, use `useEffect` + `fetch` instead. Do not install new packages if `useEffect` covers the need — SWR is a convenience, not a requirement.

### Step 6 — Tests

`__tests__/DateRangePicker.test.tsx`:

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import DateRangePicker from "@/components/DateRangePicker";
import { getPresetRange } from "@/lib/dateRange";

const noop = jest.fn();

describe("DateRangePicker", () => {
  it("renders with default This Month label", () => {
    render(
      <DateRangePicker value={getPresetRange("this-month")} onChange={noop} />
    );
    // Label should show the current month's date range
    const button = screen.getByRole("button");
    expect(button.textContent).toMatch(/\w+ \d+ – \w+ \d+, \d{4}/);
  });

  it("clicking This Week preset calls onChange with week range", () => {
    const onChange = jest.fn();
    render(
      <DateRangePicker value={getPresetRange("this-month")} onChange={onChange} />
    );
    // Open picker
    fireEvent.click(screen.getByRole("button"));
    // Click This Week preset
    fireEvent.click(screen.getByText("This Week"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ from: expect.any(Date) })
    );
  });
});
```

### DoD check

| Confirmed | How                                                              | Item                   |
| --------- | ---------------------------------------------------------------- | ---------------------- |
| [x]       | Picker renders with "This Month" label on first load             | Default preset correct |
| [x]       | Selecting "This Week" updates label and refetches dashboard data | Preset filtering works |
| [x]       | Selecting "All Time" removes date filter — all applications show | All Time works         |
| [x]       | Custom date range via calendar updates all dashboard panels      | Custom range works     |
| [x]       | Dark mode: picker button and popover styled correctly            | Dark mode correct      |
| [x]       | `npm test` — DateRangePicker.test.tsx passes (2 tests)           | Tests passing          |
| [x]       | `npm run build` — no errors                                      | Build clean            |

---

## PBI-051 — Dashboard Layout Restructure

**Goal:** Rebuild `app/dashboard/page.tsx` to match the mock-up's two-column card grid. All data comes from components already built in this sprint. The Kanban board remains on `/dashboard/pipeline` — unchanged.

### Step 1 — Pipeline Overview Bar

This replaces or supplements `StatsBar`. It shows stage counts in a horizontal progress-style row:

Create `components/PipelineBar.tsx`:

```typescript
import { ApplicationStage } from "@prisma/client";

interface StageCount {
  stage: ApplicationStage;
  count: number;
  delta?: number; // change vs previous period — optional
}

interface PipelineBarProps {
  stages: StageCount[];
}

const STAGE_CONFIG: {
  stage: ApplicationStage;
  label: string;
  colour: string;
  dotColour: string;
}[] = [
  { stage: "APPLIED",    label: "Applied",    colour: "bg-blue-500",   dotColour: "bg-blue-500" },
  { stage: "SCREENING",  label: "Screening",  colour: "bg-cyan-500",   dotColour: "bg-cyan-500" },
  { stage: "INTERVIEW",  label: "Interview",  colour: "bg-purple-500", dotColour: "bg-purple-500" },
  { stage: "ASSESSMENT", label: "Assessment", colour: "bg-yellow-500", dotColour: "bg-yellow-500" },
  { stage: "OFFER",      label: "Offer",      colour: "bg-green-400",  dotColour: "bg-green-400" },
  { stage: "CLOSED",     label: "Hired",      colour: "bg-green-600",  dotColour: "bg-green-600" },
];

export default function PipelineBar({ stages }: PipelineBarProps) {
  const stageMap = Object.fromEntries(stages.map((s) => [s.stage, s]));

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-800 p-6">
      <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Pipeline Overview
      </h2>

      {/* Progress bar track */}
      <div className="relative mb-6 flex items-center gap-0">
        {STAGE_CONFIG.map((config, i) => (
          <div key={config.stage} className="flex flex-1 items-center">
            <div
              className={`h-2 w-full ${i === 0 ? "rounded-l-full" : ""} ${
                i === STAGE_CONFIG.length - 1 ? "rounded-r-full" : ""
              } ${config.colour} opacity-80`}
            />
            {i < STAGE_CONFIG.length - 1 && (
              <div className={`h-3 w-3 shrink-0 rounded-full ${config.dotColour}
                               ring-2 ring-white dark:ring-gray-800`} />
            )}
          </div>
        ))}
      </div>

      {/* Stage counts */}
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {STAGE_CONFIG.map((config) => {
          const data = stageMap[config.stage];
          return (
            <div key={config.stage} className="text-center">
              <p className={`text-xs font-medium ${config.dotColour.replace("bg-", "text-")}`}>
                {config.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data?.count ?? 0}
              </p>
              {data?.delta !== undefined && data.delta !== 0 && (
                <p className={`text-xs font-medium ${
                  data.delta > 0 ? "text-green-500" : "text-red-400"
                }`}>
                  {data.delta > 0 ? `+${data.delta}` : data.delta} this week
                </p>
              )}
              {(!data?.delta) && (
                <p className="text-xs text-gray-400 dark:text-gray-500">No change</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Step 2 — Upcoming Panel (reminders reused)

Create `components/UpcomingPanel.tsx`:

```typescript
import Link from "next/link";
import { format } from "date-fns";

interface Reminder {
  id: string;
  company: string;
  role: string;
  stage: string;
  followUpAt: string;
}

const STAGE_BADGE: Record<string, string> = {
  INTERVIEW:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  APPLIED:    "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  SCREENING:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ASSESSMENT: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  OFFER:      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CLOSED:     "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STAGE_LABEL: Record<string, string> = {
  APPLIED: "Applied", SCREENING: "Screening", INTERVIEW: "Interview",
  ASSESSMENT: "Assessment", OFFER: "Offer", CLOSED: "Closed",
};

export default function UpcomingPanel({ reminders }: { reminders: Reminder[] }) {
  const upcoming = reminders.slice(0, 4);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-800 p-6">
      <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Upcoming
      </h2>

      {upcoming.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No upcoming follow-ups.
        </p>
      ) : (
        <ul className="space-y-3">
          {upcoming.map((r) => {
            const date = new Date(r.followUpAt);
            return (
              <li key={r.id}>
                <Link
                  href={`/dashboard/applications/${r.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 -mx-2
                             hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {/* Date badge */}
                  <div className="flex w-12 shrink-0 flex-col items-center
                                  rounded-lg bg-blue-50 dark:bg-blue-900/20 py-1.5">
                    <span className="text-[10px] font-semibold uppercase
                                     text-blue-500 dark:text-blue-400">
                      {format(date, "MMM")}
                    </span>
                    <span className="text-lg font-bold leading-none
                                     text-blue-700 dark:text-blue-300">
                      {format(date, "d")}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium
                                  text-gray-900 dark:text-gray-100">
                      {r.role}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {r.company} · {format(date, "h:mm a")}
                    </p>
                  </div>

                  {/* Stage badge */}
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs
                                    font-medium ${STAGE_BADGE[r.stage] ?? ""}`}>
                    {STAGE_LABEL[r.stage] ?? r.stage}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/dashboard/reminders"
        className="mt-4 block text-xs font-medium text-blue-600
                   dark:text-blue-400 hover:underline"
      >
        View all reminders →
      </Link>
    </div>
  );
}
```

### Step 3 — Tasks Panel (reminders as tasks)

`components/TasksPanel.tsx`:

```typescript
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Reminder {
  id: string;
  company: string;
  role: string;
  followUpAt: string;
}

export default function TasksPanel({ reminders }: { reminders: Reminder[] }) {
  const now = new Date(new Date().toDateString());
  const overdue = reminders.filter((r) => new Date(r.followUpAt) < now);
  const total = reminders.length;
  const completed = total - overdue.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-800 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Tasks
        </h2>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {completed} / {total} on track
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700">
        <div
          className="h-1.5 rounded-full bg-blue-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Overdue items */}
      {overdue.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">
          All caught up — no overdue follow-ups.
        </p>
      ) : (
        <ul className="space-y-2">
          {overdue.slice(0, 4).map((r) => (
            <li key={r.id}
                className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-400" />
                <Link
                  href={`/dashboard/applications/${r.id}`}
                  className="truncate text-sm text-gray-700 dark:text-gray-300
                             hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Follow up with {r.company} — {r.role}
                </Link>
              </div>
              <span className="shrink-0 text-xs text-red-400 font-medium">
                {formatDistanceToNow(new Date(r.followUpAt), { addSuffix: true })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Step 4 — Redesigned dashboard page

`app/dashboard/page.tsx` (or `DashboardClient.tsx` if you keep it as a client component):

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PipelineBar from "@/components/PipelineBar";
import UpcomingPanel from "@/components/UpcomingPanel";
import ActivityFeed from "@/components/ActivityFeed";
import TasksPanel from "@/components/TasksPanel";
import { PipelineChart } from "@/components/PipelineChart"; // existing component

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // Fetch all dashboard data server-side
  const [applications, reminders, activity] = await Promise.all([
    prisma.application.findMany({
      where: { userId, deletedAt: null },
      select: { id: true, stage: true, appliedAt: true },
    }),
    prisma.application.findMany({
      where: { userId, deletedAt: null, followUpAt: { not: null } },
      select: { id: true, company: true, role: true, stage: true, followUpAt: true },
      orderBy: { followUpAt: "asc" },
    }),
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  // Stage counts for PipelineBar
  const stageCounts = ["APPLIED", "SCREENING", "INTERVIEW", "ASSESSMENT", "OFFER", "CLOSED"]
    .map((stage) => ({
      stage: stage as any,
      count: applications.filter((a) => a.stage === stage).length,
    }));

  const userName = session.user.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {greeting}, {userName} 👋 · Here&apos;s what&apos;s happening with your job search.
          </p>
        </div>

        {/* Pipeline Overview */}
        <div className="mb-6">
          <PipelineBar stages={stageCounts} />
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

          {/* Left column — 60% */}
          <div className="space-y-6 lg:col-span-3">
            <UpcomingPanel reminders={reminders as any} />
            <div className="rounded-xl border border-gray-200 dark:border-gray-700
                            bg-white dark:bg-gray-800 p-6">
              <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Recent Activity
              </h2>
              <ActivityFeed events={activity as any} />
            </div>
          </div>

          {/* Right column — 40% */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700
                            bg-white dark:bg-gray-800 p-6">
              <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Application Analytics
              </h2>
              <PipelineChart applications={applications as any} />
            </div>
            <TasksPanel reminders={reminders as any} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

> **`DateRangePicker` integration:** The page above uses server-side data fetching for simplicity and performance. To wire in the `DateRangePicker`, extract the data-fetching into a client component (`DashboardClient.tsx`) that uses `useEffect`/`fetch` or SWR with the date params. The server component becomes a shell that renders `DashboardClient`. This is a clean separation — the server component handles auth and the initial render; the client component handles interactivity.

### Step 5 — Redesigned sidebar

Update your existing sidebar/nav component:

```typescript
const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: GridIcon },
  {
    label: "Applications",
    href: "/dashboard/applications",
    icon: BriefcaseIcon,
  },
  { label: "Pipeline", href: "/dashboard/pipeline", icon: KanbanIcon },
  { label: "Contacts", href: "/dashboard/contacts", icon: UsersIcon },
  { label: "Reminders", href: "/dashboard/reminders", icon: BellIcon },
  { label: "Analytics", href: "/dashboard/analytics", icon: ChartIcon },
  { label: "Documents", href: "/dashboard/resumes", icon: FileIcon },
  { label: "Settings", href: "/dashboard/settings", icon: GearIcon },
];

// Sidebar shell:
 <aside
      className="flex h-screen w-64 shrink-0 flex-col border-r border-gray-200
                    dark:border-gray-700 bg-white dark:bg-gray-900"
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 border-b border-gray-200
                      dark:border-gray-700 px-6 py-5 h-24"
      >
        {/* Light mode logo */}
        <Image
          src="/hireflow-horizontal.png"
          alt="HireFlow"
          width={140}
          height={40}
          quality={100}
          className="h-auto w-auto object-contain dark:hidden"
        />
        {/* Dark mode logo */}
        <Image
          src="/hireflow-horizontal-dark.png"
          alt="HireFlow"
          width={140}
          height={40}
          quality={100}
          className="h-auto w-auto object-contain hidden dark:block"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm
                          font-medium transition-colors
                          ${
                            isActive
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                          }`}
            >
              <item.icon
                className={`h-4 w-4 shrink-0 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center
                          rounded-full bg-blue-600 text-sm font-bold text-white"
          >
            {userName[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
              {userName}
            </p>
            <p className="truncate text-xs text-gray-400 dark:text-gray-500">
              {userEmail}
            </p>
          </div>
        </div>
      </div>
    </aside>
```

### Step 6 — Tests

`__tests__/Dashboard.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import PipelineBar from "@/components/PipelineBar";
import UpcomingPanel from "@/components/UpcomingPanel";
import TasksPanel from "@/components/TasksPanel";

const STAGE_COUNTS = [
  { stage: "APPLIED" as const, count: 5 },
  { stage: "SCREENING" as const, count: 3 },
  { stage: "INTERVIEW" as const, count: 2 },
  { stage: "ASSESSMENT" as const, count: 1 },
  { stage: "OFFER" as const, count: 1 },
  { stage: "CLOSED" as const, count: 0 },
];

describe("PipelineBar", () => {
  it("renders all 6 stage labels", () => {
    render(<PipelineBar stages={STAGE_COUNTS} />);
    expect(screen.getByText("Applied")).toBeInTheDocument();
    expect(screen.getByText("Interview")).toBeInTheDocument();
    expect(screen.getByText("Hired")).toBeInTheDocument();
  });
});

describe("UpcomingPanel", () => {
  it("renders reminder items", () => {
    const reminders = [{
      id: "r1", company: "Acme", role: "Engineer",
      stage: "INTERVIEW",
      followUpAt: new Date(Date.now() + 86400000).toISOString(),
    }];
    render(<UpcomingPanel reminders={reminders} />);
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText(/view all reminders/i)).toBeInTheDocument();
  });
});

describe("TasksPanel", () => {
  it("renders progress bar and task list", () => {
    const reminders = [
      { id: "r1", company: "Acme", role: "Engineer",
        followUpAt: new Date(Date.now() - 86400000).toISOString() }, // overdue
      { id: "r2", company: "BetaCo", role: "PM",
        followUpAt: new Date(Date.now() + 86400000).toISOString() }, // future
    ];
    render(<TasksPanel reminders={reminders} />);
    expect(screen.getByText(/1 \/ 2 on track/i)).toBeInTheDocument();
  });
});
```

### DoD check

| Confirmed | How                                                              | Item               |
| --------- | ---------------------------------------------------------------- | ------------------ |
| [x]       | Dashboard renders new two-column layout at 1280px                | Layout correct     |
| [x]       | Pipeline bar shows correct stage counts                          | Data correct       |
| [x]       | Upcoming panel shows reminders with date badges                  | Reminders display  |
| [x]       | Recent Activity shows events from ActivityLog                    | Feed works         |
| [x]       | Tasks panel shows overdue count and progress bar                 | Tasks display      |
| [x]       | Analytics donut chart renders correctly (existing PipelineChart) | Chart unchanged    |
| [x]       | Sidebar shows all nav items with icons, active state highlighted | Sidebar correct    |
| [x]       | Dark mode: all panels, sidebar, badges correct at toggle         | Dark mode complete |
| [x]       | Mobile at 375px: single column, sidebar accessible               | Mobile responsive  |
| [x]       | `npm test` — Dashboard.test.tsx passes (3+ tests)                | Tests passing      |
| [x]       | `npm run build` — no errors                                      | Build clean        |
| [x]       | `npx tsc --noEmit` — zero errors                                 | TypeScript clean   |
| [x]       | Manual: full light + dark review at desktop and mobile           | Visual QA done     |

---

## Before Merging to `develop`

```bash
npx tsc --noEmit
npm run lint
npm test          # expect 122+ passing
npm run build
npm run test:e2e  # E2E journeys should still pass with new layout
```

Commit message:

```
git commit -m "[PBI-047 to PBI-051] Sprint 6B: Dark mode, activity log, notification bell, date range filter, dashboard redesign"
git push origin feat/sprint-06b-ui-ux-ugrade
```

PR title:

> **Sprint 6B: HireFlow UI/UX upgrade — dark mode, activity feed, notification bell, date range filtering, and dashboard redesign matching the mock-up.**

---

## Sprint Close Checklist

After PR merges to `develop`:

- [x] Mark all 5 PBIs `[x]` in `sprint-06b.md`
- [x] Mark PBI-047 through PBI-051 `[x]` in `product.md`
- [x] Complete Sprint Review and Retrospective in `sprint-06b.md`
- [x] Commit updated docs to `develop`
- [x] Update Notion Sprint Board
- [x] PR from `develop` → `main` — CI passes
- [x] Vercel production deployment confirmed live

---

_sprint-06b-implementation-part2.md — 26 May 2026 — HireFlow_
_Branch: `feature/sprint-06b-ui-upgrade`. Build PBIs in dependency order. Run `npm run build` locally before every push._
