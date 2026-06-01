import { ActivityAction } from "@prisma/client";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface ActivityEvent {
  id: string;
  action: ActivityAction;
  applicationId: string | null;
  metadata: Record<string, string | null> | null;
  createdAt: string; // ISO string — serialised from server
}

interface ActivityFeedProps {
  events: ActivityEvent[];
}

const ACTION_ICONS: Record<ActivityAction, string> = {
  APPLICATION_CREATED: "✦",
  APPLICATION_DELETED: "✕",
  STAGE_CHANGED: "→",
  RESUME_LINKED: "📎",
  NOTE_ADDED: "✎",
};

function describeAction(
  action: ActivityAction,
  metadata: Record<string, string | null> | null,
): string {
  const m = metadata ?? {};
  const who =
    m.role && m.company ? `${m.role} at ${m.company}` : "an application";

  switch (action) {
    case "APPLICATION_CREATED":
      return `You added ${who}`;
    case "APPLICATION_DELETED":
      return `You removed ${who}`;
    case "STAGE_CHANGED":
      return `You moved ${who} to ${m.toStage ?? "a new stage"}`;
    case "RESUME_LINKED":
      return `You linked a resume to ${who}`;
    case "NOTE_ADDED":
      return `You added a note to ${who}`;
    default:
      return "Activity recorded";
  }
}

export default function ActivityFeed({ events }: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No activity yet. Add your first application to get started.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {events.map((event) => {
        const content = (
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center
                         rounded-full bg-blue-50 dark:bg-blue-900/30
                         text-sm text-blue-600 dark:text-blue-400"
            >
              {ACTION_ICONS[event.action]}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {describeAction(event.action, event.metadata)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {formatDistanceToNow(new Date(event.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        );

        return (
          <li key={event.id}>
            {event.applicationId ? (
              <Link
                href={`/dashboard/applications/${event.applicationId}`}
                className="block rounded-md px-2 -mx-2 hover:bg-gray-50
                           dark:hover:bg-gray-700/50 transition-colors"
              >
                {content}
              </Link>
            ) : (
              <div className="px-2 -mx-2">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
