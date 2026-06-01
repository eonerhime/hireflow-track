// components/TimeInStageChart.tsx
"use client";

import { ApplicationStage } from "@prisma/client";

interface StageAvg {
  stage: ApplicationStage;
  avgDays: number;
}

export interface TimeInStageChartProps {
  timeInStage: StageAvg[];
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
  APPLIED: "bg-blue-400   dark:bg-blue-500",
  SCREENING: "bg-yellow-400 dark:bg-yellow-500",
  INTERVIEW: "bg-purple-400 dark:bg-purple-500",
  ASSESSMENT: "bg-orange-400 dark:bg-orange-500",
  OFFER: "bg-green-400  dark:bg-green-500",
  CLOSED: "bg-gray-400   dark:bg-gray-500",
};

export default function TimeInStageChart({
  timeInStage,
}: TimeInStageChartProps) {
  if (timeInStage.length === 0) return null;

  const maxDays = Math.max(...timeInStage.map((d) => d.avgDays), 1);

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm
                    dark:border-gray-700 dark:bg-gray-800"
    >
      <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Avg. Days in Stage
      </h2>
      <div className="space-y-3">
        {timeInStage.map(({ stage, avgDays }) => (
          <div key={stage}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {STAGE_LABELS[stage]}
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {avgDays}d
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
              <div
                className={`h-2 rounded-full ${STAGE_COLOURS[stage]} transition-all duration-500`}
                style={{ width: `${(avgDays / maxDays) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
