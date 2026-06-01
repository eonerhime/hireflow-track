// components/KanbanCard.tsx
"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Application } from "@prisma/client";
import Link from "next/link";

interface KanbanCardProps {
  application: Application;
  index: number;
}

export default function KanbanCard({ application, index }: KanbanCardProps) {
  const isOverdue =
    application.followUpAt &&
    new Date(application.followUpAt) < new Date() &&
    application.stage !== "CLOSED";

  return (
    <Draggable draggableId={application.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded-md border bg-white p-3 shadow-sm
                      dark:bg-gray-800 dark:border-gray-700
                      ${
                        snapshot.isDragging
                          ? "shadow-lg ring-2 ring-indigo-400 dark:ring-indigo-500"
                          : "hover:border-indigo-300 dark:hover:border-indigo-500"
                      }`}
        >
          <Link
            href={`/dashboard/applications/${application.id}?from=kanban`}
            onClick={(e) => snapshot.isDragging && e.preventDefault()}
          >
            <p
              className="text-sm font-medium text-gray-900 leading-tight
                          dark:text-gray-100"
            >
              {application.role}
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {application.company}
            </p>
            {isOverdue && (
              <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                ⚠ Follow-up overdue
              </p>
            )}
          </Link>
        </div>
      )}
    </Draggable>
  );
}
