// components/PipelineChartPanel.tsx
"use client";

import { useState } from "react";
import { ApplicationStage } from "@prisma/client";
import PipelineChart from "./PipelineChart";
import DonutChart from "./DonutChart";

interface StageCount {
  stage: ApplicationStage;
  count: number;
}

interface PipelineChartPanelProps {
  stageCounts: StageCount[];
}

type ChartView = "bar" | "donut";

export default function PipelineChartPanel({
  stageCounts,
}: PipelineChartPanelProps) {
  const [chartView, setChartView] = useState<ChartView>("donut");

  return (
    <div>
      {/* Toggle */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Pipeline Distribution
        </p>
        <div
          className="flex rounded-md border border-gray-200 dark:border-gray-600
                        bg-gray-50 dark:bg-gray-900 p-0.5"
        >
          <button
            type="button"
            onClick={() => setChartView("donut")}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors
              ${
                chartView === "donut"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            Donut
          </button>
          <button
            type="button"
            onClick={() => setChartView("bar")}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors
              ${
                chartView === "bar"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            Bar
          </button>
        </div>
      </div>

      {/* Chart */}
      {chartView === "donut" ? (
        <DonutChart stageCounts={stageCounts} />
      ) : (
        <PipelineChart stageCounts={stageCounts} />
      )}
    </div>
  );
}
