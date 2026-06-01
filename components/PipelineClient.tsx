// components/PipelineClient.tsx
"use client";

import { useState } from "react";
import { Application, ApplicationStage } from "@prisma/client";
import KanbanBoard from "./KanbanBoard";

interface PipelineClientProps {
  applications: Application[];
}

export default function PipelineClient({
  applications: initial,
}: PipelineClientProps) {
  const [applications, setApplications] = useState(initial);

  const handleStageChange = (id: string, newStage: ApplicationStage) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, stage: newStage } : app)),
    );
  };

  return (
    <KanbanBoard
      applications={applications}
      onStageChange={handleStageChange}
    />
  );
}
