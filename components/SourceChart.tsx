// components/SourceChart.tsx
"use client";

interface SourceRow {
  source: string;
  total: number;
  interviewRate: number;
  offerRate: number;
}

export interface SourceChartProps {
  sourceEffectiveness: SourceRow[];
}

const SOURCE_LABELS: Record<string, string> = {
  LINKEDIN: "LinkedIn",
  REFERRAL: "Referral",
  COLD_APPLY: "Cold Apply",
  JOB_BOARD: "Job Board",
  OTHER: "Other",
  UNTAGGED: "Untagged",
};

export default function SourceChart({ sourceEffectiveness }: SourceChartProps) {
  if (sourceEffectiveness.length === 0) return null;

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm
                    dark:border-gray-700 dark:bg-gray-800"
    >
      <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Source Effectiveness
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              className="border-b border-gray-100 text-left text-xs font-medium
                           text-gray-500 dark:border-gray-700 dark:text-gray-400"
            >
              <th className="pb-2 pr-4">Source</th>
              <th className="pb-2 pr-4 text-right">Apps</th>
              <th className="pb-2 pr-4 text-right">Interview rate</th>
              <th className="pb-2 text-right">Offer rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {sourceEffectiveness.map(
              ({ source, total, interviewRate, offerRate }) => (
                <tr key={source}>
                  <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                    {SOURCE_LABELS[source] ?? source}
                  </td>
                  <td className="py-2 pr-4 text-right text-gray-600 dark:text-gray-400">
                    {total}
                  </td>
                  <td className="py-2 pr-4 text-right text-gray-600 dark:text-gray-400">
                    {interviewRate}%
                  </td>
                  <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                    {offerRate}%
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
