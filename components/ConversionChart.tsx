// components/ConversionChart.tsx
"use client";

import { Application } from "@prisma/client";

interface ConversionChartProps {
  applications: Application[];
}

const INTERVIEW_OR_BEYOND = ["INTERVIEW", "ASSESSMENT", "OFFER", "CLOSED"];
const OFFER_OR_BEYOND = ["OFFER", "CLOSED"];

function computeRates(applications: Application[]) {
  const total = applications.length;
  const atInterviewOrBeyond = applications.filter((a) =>
    INTERVIEW_OR_BEYOND.includes(a.stage),
  ).length;
  const atOfferOrBeyond = applications.filter((a) =>
    OFFER_OR_BEYOND.includes(a.stage),
  ).length;

  return {
    appliedToInterview:
      total === 0 ? 0 : Math.round((atInterviewOrBeyond / total) * 100),
    interviewToOffer:
      atInterviewOrBeyond === 0
        ? 0
        : Math.round((atOfferOrBeyond / atInterviewOrBeyond) * 100),
  };
}

export default function ConversionChart({
  applications,
}: ConversionChartProps) {
  const rates = computeRates(applications);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-900">
        Conversion Rates
      </h2>
      <div className="space-y-4">
        <ConversionRow
          label="Applied → Interview"
          value={rates.appliedToInterview}
          colour="bg-indigo-500"
        />
        <ConversionRow
          label="Interview → Offer"
          value={rates.interviewToOffer}
          colour="bg-green-500"
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
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-2 rounded-full ${colour} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
