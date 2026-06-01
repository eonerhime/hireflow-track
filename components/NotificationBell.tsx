"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Reminder {
  id: string;
  company: string;
  role: string;
  stage: string;
  followUpAt: string;
}

const POLL_INTERVAL_MS = 30_000; // 30 seconds

export default function NotificationBell() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchReminders = useCallback(() => {
    fetch("/api/reminders")
      .then((r) => r.json())
      .then(setReminders)
      .catch(() => setReminders([]));
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // Poll every 30 s
  useEffect(() => {
    const id = setInterval(fetchReminders, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchReminders]);

  // Re-fetch immediately when the tab/window regains focus
  // This is the key fix: update a reminder → navigate back → bell refreshes instantly
  useEffect(() => {
    window.addEventListener("focus", fetchReminders);
    return () => window.removeEventListener("focus", fetchReminders);
  }, [fetchReminders]);

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
    (r) => new Date(r.followUpAt) < new Date(new Date().toDateString()),
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
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002
               6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6
               8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6
               0v1a3 3 0 11-6 0v-1m6 0H9"
          />
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
            <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No upcoming reminders
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {preview.map((r) => {
                const overdue =
                  new Date(r.followUpAt) < new Date(new Date().toDateString());
                return (
                  <li key={r.id}>
                    <Link
                      href={`/dashboard/applications/${r.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-start justify-between gap-2 px-4 py-3
                                 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                          {r.role}
                        </p>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
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
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all reminders →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
