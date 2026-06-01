// components/ApplicationCard.tsx
import Link from "next/link";
import { Application, ApplicationStage } from "@prisma/client";

const stageColours: Record<ApplicationStage, string> = {
  APPLIED:
    "bg-blue-100   text-blue-800   dark:bg-blue-900/40  dark:text-blue-300",
  SCREENING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  INTERVIEW:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  ASSESSMENT:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  OFFER:
    "bg-green-100  text-green-800  dark:bg-green-900/40  dark:text-green-300",
  CLOSED:
    "bg-gray-100   text-gray-600   dark:bg-gray-700      dark:text-gray-400",
};

const stageLabels: Record<ApplicationStage, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  ASSESSMENT: "Assessment",
  OFFER: "Offer",
  CLOSED: "Closed",
};

interface ApplicationCardProps {
  application: Application;
}

export default function ApplicationCard({ application }: ApplicationCardProps) {
  const isOverdue =
    application.followUpAt &&
    new Date(application.followUpAt) < new Date() &&
    application.stage !== "CLOSED";

  return (
    <Link
      href={`/dashboard/applications/${application.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm
                 hover:border-indigo-300 hover:shadow-md transition-all
                 dark:border-gray-700 dark:bg-gray-800
                 dark:hover:border-indigo-500"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900 dark:text-gray-100">
            {application.role}
          </p>
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
            {application.company}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium
                      ${stageColours[application.stage]}`}
        >
          {stageLabels[application.stage]}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
        {application.location && <span>{application.location}</span>}
        {application.salary && <span>{application.salary}</span>}
        {isOverdue && (
          <span className="font-medium text-red-600 dark:text-red-400">
            ⚠ Follow-up overdue
          </span>
        )}
      </div>
    </Link>
  );
}
