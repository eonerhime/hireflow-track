// components/AnalyticsClient.tsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import DateRangePicker from "./DateRangePicker";
import PipelineChartPanel from "./PipelineChartPanel";
import ConversionChart from "./ConversionChart";
import TimeInStageChart from "./TimeInStageChart";
import SourceChart from "./SourceChart";
import { DateRange, getPresetRange, rangeToParams } from "@/lib/dateRange";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AnalyticsClient() {
  const [range, setRange] = useState<DateRange>(getPresetRange("all-time"));

  const params = rangeToParams(range);
  const queryString = params.from
    ? `?${new URLSearchParams(params as Record<string, string>)}`
    : "";

  const { data: metrics } = useSWR(
    `/api/dashboard/metrics${queryString}`,
    fetcher,
  );

  return (
    <div className="space-y-6">
      {/* Date range filter */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Filter by period
        </p>
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      {!metrics && (
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Loading analytics…
        </p>
      )}

      {metrics && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {metrics.stageCounts?.length > 0 && (
            <div
              className="rounded-xl border border-gray-200 dark:border-gray-700
                            bg-white dark:bg-gray-800 p-6"
            >
              <PipelineChartPanel stageCounts={metrics.stageCounts} />
            </div>
          )}
          <div
            className="rounded-xl border border-gray-200 dark:border-gray-700
                          bg-white dark:bg-gray-800 p-6"
          >
            <ConversionChart conversionRates={metrics.conversionRates} />
          </div>
          {metrics.timeInStage?.length > 0 && (
            <div
              className="rounded-xl border border-gray-200 dark:border-gray-700
                            bg-white dark:bg-gray-800 p-6"
            >
              <TimeInStageChart timeInStage={metrics.timeInStage} />
            </div>
          )}
          {metrics.sourceEffectiveness?.length > 0 && (
            <div
              className="rounded-xl border border-gray-200 dark:border-gray-700
                            bg-white dark:bg-gray-800 p-6"
            >
              <SourceChart sourceEffectiveness={metrics.sourceEffectiveness} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
