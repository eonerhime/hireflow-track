// components/SourceChart.tsx
"use client";

import { Application } from "@prisma/client";

interface SourceChartProps {
  applications: Application[];
}

interface SourceCounts {
  total: number;
  interviews: number;
  offers: number;
}

interface SourceRow {
  source: string;
  total: number;
  interviewRate: number;
  offerRate: number;
}

const SOURCE_LABELS: Record<string, string> = {
  LINKEDIN: "LinkedIn",
  REFERRAL: "Referral",
  COLD_APPLY: "Cold Apply",
  JOB_BOARD: "Job Board",
  OTHER: "Other",
  UNTAGGED: "Untagged",
};

const INTERVIEW_OR_BEYOND = ["INTERVIEW", "ASSESSMENT", "OFFER", "CLOSED"];
const OFFER_OR_BEYOND = ["OFFER", "CLOSED"];

function computeSourceEffectiveness(applications: Application[]): SourceRow[] {
  const totals: Record<string, SourceCounts> = {};

  for (const app of applications) {
    const key = app.source ?? "UNTAGGED";
    if (!totals[key]) totals[key] = { total: 0, interviews: 0, offers: 0 };
    totals[key].total += 1;
    if (INTERVIEW_OR_BEYOND.includes(app.stage)) totals[key].interviews += 1;
    if (OFFER_OR_BEYOND.includes(app.stage)) totals[key].offers += 1;
  }

  return Object.entries(totals)
    .map(([source, counts]) => ({
      source,
      total: counts.total,
      interviewRate:
        counts.total === 0
          ? 0
          : Math.round((counts.interviews / counts.total) * 100),
      offerRate:
        counts.total === 0
          ? 0
          : Math.round((counts.offers / counts.total) * 100),
    }))
    .sort((a, b) => b.total - a.total);
}

export default function SourceChart({ applications }: SourceChartProps) {
  const data = computeSourceEffectiveness(applications);

  if (data.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-900">
        Source Effectiveness
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500">
              <th className="pb-2 pr-4">Source</th>
              <th className="pb-2 pr-4 text-right">Apps</th>
              <th className="pb-2 pr-4 text-right">Interview rate</th>
              <th className="pb-2 text-right">Offer rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map(({ source, total, interviewRate, offerRate }) => (
              <tr key={source}>
                <td className="py-2 pr-4 font-medium text-gray-900">
                  {SOURCE_LABELS[source] ?? source}
                </td>
                <td className="py-2 pr-4 text-right text-gray-600">{total}</td>
                <td className="py-2 pr-4 text-right text-gray-600">
                  {interviewRate}%
                </td>
                <td className="py-2 text-right text-gray-600">{offerRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
