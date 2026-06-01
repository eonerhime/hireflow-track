// components/KanbanBoard.tsx
"use client";

import { useState, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Application, ApplicationStage } from "@prisma/client";
import KanbanColumn from "./KanbanColumn";

const STAGES: ApplicationStage[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "ASSESSMENT",
  "OFFER",
  "CLOSED",
];

interface KanbanBoardProps {
  applications: Application[];
  onStageChange: (id: string, newStage: ApplicationStage) => void;
}

export default function KanbanBoard({
  applications: initialApplications,
  onStageChange,
}: KanbanBoardProps) {
  const [localApps, setLocalApps] =
    useState<Application[]>(initialApplications);

  const getByStage = (stage: ApplicationStage) =>
    localApps.filter((a) => a.stage === stage);

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { draggableId, destination, source } = result;

      if (!destination) return;
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      )
        return;

      const newStage = destination.droppableId as ApplicationStage;
      const oldStage = source.droppableId as ApplicationStage;

      setLocalApps((prev) =>
        prev.map((app) =>
          app.id === draggableId ? { ...app, stage: newStage } : app,
        ),
      );

      try {
        const res = await fetch(`/api/applications/${draggableId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: newStage }),
        });

        if (res.ok) {
          onStageChange(draggableId, newStage);
        } else {
          setLocalApps((prev) =>
            prev.map((app) =>
              app.id === draggableId ? { ...app, stage: oldStage } : app,
            ),
          );
        }
      } catch {
        setLocalApps((prev) =>
          prev.map((app) =>
            app.id === draggableId ? { ...app, stage: oldStage } : app,
          ),
        );
      }
    },
    [onStageChange],
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            applications={getByStage(stage)}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
