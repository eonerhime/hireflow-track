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
    <div
      className="rounded-xl border border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-800 p-6"
    >
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
            <li key={r.id} className="flex items-start justify-between gap-2">
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
                {formatDistanceToNow(new Date(r.followUpAt), {
                  addSuffix: true,
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
