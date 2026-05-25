// components/TimeInStageChart.tsx
"use client";

import { Application, ApplicationStage } from "@prisma/client";

interface TimeInStageChartProps {
  applications: Application[];
}

const STAGE_ORDER: ApplicationStage[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "ASSESSMENT",
  "OFFER",
  "CLOSED",
];

const STAGE_LABELS: Record<ApplicationStage, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  ASSESSMENT: "Assessment",
  OFFER: "Offer",
  CLOSED: "Closed",
};

const STAGE_COLOURS: Record<ApplicationStage, string> = {
  APPLIED: "bg-blue-400",
  SCREENING: "bg-yellow-400",
  INTERVIEW: "bg-purple-400",
  ASSESSMENT: "bg-orange-400",
  OFFER: "bg-green-400",
  CLOSED: "bg-gray-400",
};

interface StageAvg {
  stage: ApplicationStage;
  avgDays: number;
}

function computeTimeInStage(applications: Application[]): StageAvg[] {
  const now = Date.now();
  const stageTotals: Record<string, { totalDays: number; count: number }> = {};

  for (const app of applications) {
    if (!app.stageEnteredAt) continue;
    const days =
      (now - new Date(app.stageEnteredAt).getTime()) / (1000 * 60 * 60 * 24);
    if (!stageTotals[app.stage]) {
      stageTotals[app.stage] = { totalDays: 0, count: 0 };
    }
    stageTotals[app.stage].totalDays += days;
    stageTotals[app.stage].count += 1;
  }

  return STAGE_ORDER.filter((stage) => stageTotals[stage]).map((stage) => ({
    stage,
    avgDays: Math.round(
      stageTotals[stage].totalDays / stageTotals[stage].count,
    ),
  }));
}

export default function TimeInStageChart({
  applications,
}: TimeInStageChartProps) {
  const data = computeTimeInStage(applications);

  if (data.length === 0) return null;

  const maxDays = Math.max(...data.map((d) => d.avgDays), 1);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-900">
        Avg. Days in Stage
      </h2>
      <div className="space-y-3">
        {data.map(({ stage, avgDays }) => (
          <div key={stage}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-gray-600">{STAGE_LABELS[stage]}</span>
              <span className="font-semibold text-gray-900">{avgDays}d</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
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
