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
  INTERVIEW:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  APPLIED: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  SCREENING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ASSESSMENT:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  OFFER: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CLOSED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STAGE_LABEL: Record<string, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  ASSESSMENT: "Assessment",
  OFFER: "Offer",
  CLOSED: "Closed",
};

export default function UpcomingPanel({
  reminders,
}: {
  reminders: Reminder[];
}) {
  const upcoming = reminders.slice(0, 4);

  return (
    <div
      className="rounded-xl border border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-800 p-6"
    >
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
                  <div
                    className="flex w-12 shrink-0 flex-col items-center
                                  rounded-lg bg-blue-50 dark:bg-blue-900/20 py-1.5"
                  >
                    <span
                      className="text-[10px] font-semibold uppercase
                                     text-blue-500 dark:text-blue-400"
                    >
                      {format(date, "MMM")}
                    </span>
                    <span
                      className="text-lg font-bold leading-none
                                     text-blue-700 dark:text-blue-300"
                    >
                      {format(date, "d")}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-medium
                                  text-gray-900 dark:text-gray-100"
                    >
                      {r.role}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {r.company} · {format(date, "h:mm a")}
                    </p>
                  </div>

                  {/* Stage badge */}
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs
                                    font-medium ${STAGE_BADGE[r.stage] ?? ""}`}
                  >
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
