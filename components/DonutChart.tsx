// components/DonutChart.tsx
"use client";

import { ApplicationStage } from "@prisma/client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const STAGE_LABELS: Record<ApplicationStage, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  ASSESSMENT: "Assessment",
  OFFER: "Offer",
  CLOSED: "Hired",
};

const STAGE_HEX: Record<ApplicationStage, string> = {
  APPLIED: "#60a5fa", // blue-400
  SCREENING: "#facc15", // yellow-400
  INTERVIEW: "#c084fc", // purple-400
  ASSESSMENT: "#fb923c", // orange-400
  OFFER: "#4ade80", // green-400
  CLOSED: "#9ca3af", // gray-400
};

interface StageCount {
  stage: ApplicationStage;
  count: number;
}

interface DonutChartProps {
  stageCounts: StageCount[];
}

export default function DonutChart({ stageCounts }: DonutChartProps) {
  const total = stageCounts.reduce((sum, s) => sum + s.count, 0);

  if (total === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No applications yet. Add applications to see your pipeline distribution.
      </p>
    );
  }

  const data = stageCounts.filter((s) => s.count > 0);

  return (
    <div className="space-y-3">
      {/* Donut */}
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="stage"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.stage} fill={STAGE_HEX[entry.stage]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => {
              const count = typeof value === "number" ? value : 0;
              const pct = Math.round((count / total) * 100);
              const label =
                STAGE_LABELS[name as ApplicationStage] ?? String(name);
              return [`${count} (${pct}%)`, label];
            }}
            contentStyle={{
              backgroundColor: "var(--tooltip-bg, #1f2937)",
              border: "1px solid #374151",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#f3f4f6",
            }}
          />
          {/* Centre label */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-gray-900 dark:fill-gray-100"
            style={{ fontSize: 22, fontWeight: 700 }}
          >
            {total}
          </text>
          <text
            x="50%"
            y="50%"
            dy={20}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: 11, fill: "#9ca3af" }}
          >
            Total
          </text>
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="space-y-1.5">
        {data.map((entry) => {
          const pct = Math.round((entry.count / total) * 100);
          return (
            <div
              key={entry.stage}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: STAGE_HEX[entry.stage] }}
                />
                <span className="text-gray-600 dark:text-gray-400">
                  {STAGE_LABELS[entry.stage]}
                </span>
              </div>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {entry.count} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
