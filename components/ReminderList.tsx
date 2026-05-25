import Link from "next/link";
import { ApplicationStage } from "@prisma/client";

interface Reminder {
  id: string;
  company: string;
  role: string;
  stage: ApplicationStage;
  followUpAt: string; // ISO string — serialised from server
}

interface ReminderListProps {
  reminders: Reminder[];
}

const STAGE_LABELS: Record<ApplicationStage, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  ASSESSMENT: "Assessment",
  OFFER: "Offer",
  CLOSED: "Closed",
};

const STAGE_COLOURS: Record<ApplicationStage, string> = {
  APPLIED: "bg-gray-100 text-gray-700",
  SCREENING: "bg-blue-100 text-blue-700",
  INTERVIEW: "bg-yellow-100 text-yellow-700",
  ASSESSMENT: "bg-purple-100 text-purple-700",
  OFFER: "bg-green-100 text-green-700",
  CLOSED: "bg-red-100 text-red-700",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(iso: string): boolean {
  return new Date(iso) < new Date(new Date().toDateString());
}

export default function ReminderList({ reminders }: ReminderListProps) {
  if (reminders.length === 0) {
    return <p className="text-sm text-gray-500">No upcoming reminders.</p>;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {reminders.map((reminder) => {
        const overdue = isOverdue(reminder.followUpAt);
        return (
          <li key={reminder.id} className="py-4">
            <Link
              href={`/dashboard/applications/${reminder.id}?from=reminders`}
              className="block rounded-md px-2 -mx-2 hover:bg-gray-50 transition"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {reminder.role}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {reminder.company}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium
                                ${STAGE_COLOURS[reminder.stage]}`}
                  >
                    {STAGE_LABELS[reminder.stage]}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      overdue ? "text-red-600" : "text-gray-500"
                    }`}
                  >
                    {overdue ? "⚠ Follow-up overdue · " : ""}
                    {formatDate(reminder.followUpAt)}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}