// components/StatsBar.tsx
import { Application } from "@prisma/client";

interface StatsBarProps {
  applications: Application[];
}

export default function StatsBar({ applications }: StatsBarProps) {
  const total = applications.length;
  const active = applications.filter((a) => a.stage !== "CLOSED").length;
  const interviews = applications.filter((a) => a.stage === "INTERVIEW").length;
  const offers = applications.filter((a) => a.stage === "OFFER").length;

  const stats = [
    { label: "Total", value: total },
    { label: "Active", value: active },
    { label: "Interviews", value: interviews },
    { label: "Offers", value: offers },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm
                     dark:border-gray-700 dark:bg-gray-800"
        >
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {stat.value}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
