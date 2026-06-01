// components/ConversionChart.tsx
"use client";

interface ConversionRates {
  appliedToInterview: number;
  interviewToOffer: number;
}

export interface ConversionChartProps {
  conversionRates: ConversionRates;
}

export default function ConversionChart({
  conversionRates,
}: ConversionChartProps) {
  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm
                    dark:border-gray-700 dark:bg-gray-800"
    >
      <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Conversion Rates
      </h2>
      <div className="space-y-4">
        <ConversionRow
          label="Applied → Interview"
          value={conversionRates.appliedToInterview}
          colour="bg-indigo-500 dark:bg-indigo-400"
        />
        <ConversionRow
          label="Interview → Offer"
          value={conversionRates.interviewToOffer}
          colour="bg-green-500 dark:bg-green-400"
        />
      </div>
    </div>
  );
}

function ConversionRow({
  label,
  value,
  colour,
}: {
  label: string;
  value: number;
  colour: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {value}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
        <div
          className={`h-2 rounded-full ${colour} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
