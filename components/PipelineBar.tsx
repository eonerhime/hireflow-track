import { ApplicationStage } from "@prisma/client";

interface StageCount {
  stage: ApplicationStage;
  count: number;
  delta?: number; // change vs previous period — optional
}

interface PipelineBarProps {
  stages: StageCount[];
}

const STAGE_CONFIG: {
  stage: ApplicationStage;
  label: string;
  colour: string;
  dotColour: string;
  textColour: string; // ← add this
}[] = [
  {
    stage: "APPLIED",
    label: "Applied",
    colour: "bg-blue-500",
    dotColour: "bg-blue-500",
    textColour: "text-blue-600   dark:text-blue-400",
  },
  {
    stage: "SCREENING",
    label: "Screening",
    colour: "bg-cyan-500",
    dotColour: "bg-cyan-500",
    textColour: "text-cyan-600   dark:text-cyan-300",
  },
  {
    stage: "INTERVIEW",
    label: "Interview",
    colour: "bg-purple-500",
    dotColour: "bg-purple-500",
    textColour: "text-purple-600 dark:text-purple-300",
  },
  {
    stage: "ASSESSMENT",
    label: "Assessment",
    colour: "bg-yellow-500",
    dotColour: "bg-yellow-500",
    textColour: "text-yellow-600 dark:text-yellow-300",
  },
  {
    stage: "OFFER",
    label: "Offer",
    colour: "bg-green-400",
    dotColour: "bg-green-400",
    textColour: "text-green-600 dark:text-green-300",
  },
  {
    stage: "CLOSED",
    label: "Hired",
    colour: "bg-green-600",
    dotColour: "bg-green-600",
    textColour: "text-green-700 dark:text-green-500",
  },
];

export default function PipelineBar({ stages }: PipelineBarProps) {
  const stageMap = Object.fromEntries(stages.map((s) => [s.stage, s]));

  return (
    <div
      className="rounded-xl border border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-800 p-6"
    >
      <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Pipeline Overview
      </h2>

      {/* Progress bar track */}
      <div className="relative mb-6 flex items-center gap-0">
        {STAGE_CONFIG.map((config, i) => (
          <div key={config.stage} className="flex flex-1 items-center">
            <div
              className={`h-2 w-full ${i === 0 ? "rounded-l-full" : ""} ${
                i === STAGE_CONFIG.length - 1 ? "rounded-r-full" : ""
              } ${config.colour} opacity-80`}
            />
            {i < STAGE_CONFIG.length - 1 && (
              <div
                className={`h-3 w-3 shrink-0 rounded-full ${config.dotColour}
                               ring-2 ring-white dark:ring-gray-800Scree`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Stage counts */}
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {STAGE_CONFIG.map((config) => {
          const data = stageMap[config.stage];
          return (
            <div
              key={config.stage}
              className="text-center text-gray-900 dark:text-gray-100"
            >
              <p
                className={`text-xs font-medium ${config.dotColour.replace("bg-", "text-")}`}
              >
                {config.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data?.count ?? 0}
              </p>
              {data?.delta !== undefined && data.delta !== 0 && (
                <p
                  className={`text-xs font-medium ${
                    data.delta > 0 ? "text-green-500" : "text-red-400"
                  }`}
                >
                  {data.delta > 0 ? `+${data.delta}` : data.delta} this week
                </p>
              )}
              {!data?.delta && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  No change
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
