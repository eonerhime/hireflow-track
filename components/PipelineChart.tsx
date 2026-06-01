// components/PipelineChart.tsx
import { ApplicationStage } from "@prisma/client";

const STAGES: ApplicationStage[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "ASSESSMENT",
  "OFFER",
  "CLOSED",
];

const STAGE_COLOURS: Record<ApplicationStage, string> = {
  APPLIED: "bg-blue-400   dark:bg-blue-500",
  SCREENING: "bg-yellow-400 dark:bg-yellow-500",
  INTERVIEW: "bg-purple-400 dark:bg-purple-500",
  ASSESSMENT: "bg-orange-400 dark:bg-orange-500",
  OFFER: "bg-green-400  dark:bg-green-500",
  CLOSED: "bg-gray-300   dark:bg-gray-600",
};

interface StageCount {
  stage: ApplicationStage;
  count: number;
}

export interface PipelineChartProps {
  stageCounts: StageCount[];
}

export default function PipelineChart({ stageCounts }: PipelineChartProps) {
  const total = stageCounts.reduce((sum, s) => sum + s.count, 0);
  const countMap = Object.fromEntries(
    stageCounts.map((s) => [s.stage, s.count]),
  ) as Record<ApplicationStage, number>;

  if (total === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No applications yet. Add applications to see your pipeline distribution.
      </p>
    );
  }

  return (
    <div
      className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm
                    dark:border-gray-700 dark:bg-gray-800"
    >
      <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
        Pipeline Distribution
      </h2>

      {/* Proportional bar */}
      <div className="flex h-4 w-full overflow-hidden rounded-full">
        {STAGES.map((stage) => {
          const count = countMap[stage] ?? 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          if (pct === 0) return null;
          return (
            <div
              key={stage}
              className={`${STAGE_COLOURS[stage]} transition-all`}
              style={{ width: `${pct}%` }}
              title={`${stage}: ${count}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3">
        {STAGES.map((stage) => (
          <div key={stage} className="flex items-center gap-1.5">
            <span
              className={`h-2.5 w-2.5 rounded-full ${STAGE_COLOURS[stage]}`}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {stage.charAt(0) + stage.slice(1).toLowerCase()} (
              {countMap[stage] ?? 0})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
