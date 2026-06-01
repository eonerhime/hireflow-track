// components/KanbanColumn.tsx
import { Droppable } from "@hello-pangea/dnd";
import { Application, ApplicationStage } from "@prisma/client";
import KanbanCard from "./KanbanCard";

const stageColours: Record<ApplicationStage, string> = {
  APPLIED:
    "border-blue-200   bg-blue-50   dark:border-blue-900/50  dark:bg-blue-900/20",
  SCREENING:
    "border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20",
  INTERVIEW:
    "border-purple-200 bg-purple-50 dark:border-purple-900/50 dark:bg-purple-900/20",
  ASSESSMENT:
    "border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-900/20",
  OFFER:
    "border-green-200  bg-green-50  dark:border-green-900/50  dark:bg-green-900/20",
  CLOSED:
    "border-gray-200   bg-gray-50   dark:border-gray-700      dark:bg-gray-700/30",
};

const stageLabels: Record<ApplicationStage, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  ASSESSMENT: "Assessment",
  OFFER: "Offer",
  CLOSED: "Closed",
};

interface KanbanColumnProps {
  stage: ApplicationStage;
  applications: Application[];
}

export default function KanbanColumn({
  stage,
  applications,
}: KanbanColumnProps) {
  return (
    <div
      className="flex min-w-55 flex-col rounded-lg border bg-white shadow-sm
                    dark:border-gray-700 dark:bg-gray-800"
    >
      {/* Column header */}
      <div
        className={`rounded-t-lg border-b px-3 py-2.5 ${stageColours[stage]}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {stageLabels[stage]}
          </span>
          <span
            className="rounded-full bg-white px-2 py-0.5 text-xs font-medium
                           text-gray-500 shadow-sm
                           dark:bg-gray-700 dark:text-gray-400"
          >
            {applications.length}
          </span>
        </div>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-1 flex-col gap-2 p-2 transition-colors
                        ${
                          snapshot.isDraggingOver
                            ? "bg-indigo-50 dark:bg-indigo-900/20"
                            : ""
                        }`}
            style={{ minHeight: 120 }}
          >
            {applications.map((app, index) => (
              <KanbanCard key={app.id} application={app} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
