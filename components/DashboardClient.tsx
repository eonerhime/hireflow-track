// components/DashboardClient.tsx
"use client";

import ActivityFeed from "@/components/ActivityFeed";
import ExportButton from "@/components/ExportButton";
import PipelineBar from "@/components/PipelineBar";
import TasksPanel from "@/components/TasksPanel";
import UpcomingPanel from "@/components/UpcomingPanel";
import { DateRange, getPresetRange, rangeToParams } from "@/lib/dateRange";
import { ApplicationStage } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import ApplicationList from "./ApplicationList";
import ConversionChart from "./ConversionChart";
import DateRangePicker from "./DateRangePicker";
import KanbanBoard from "./KanbanBoard";
import PipelineChartPanel from "./PipelineChartPanel";
import SourceChart from "./SourceChart";
import StatsBar from "./StatsBar";
import TimeInStageChart from "./TimeInStageChart";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Serialised application shape from server
interface SerialisedApplication {
  id: string;
  userId: string;
  company: string;
  role: string;
  location: string | null;
  salary: string | null;
  jobUrl: string | null;
  stage: ApplicationStage;
  source: string | null;
  notes: string | null;
  resumeId: string | null;
  resumeVersionLabel: string | null;
  appliedAt: string;
  followUpAt: string | null;
  stageEnteredAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface SerialisedReminder {
  id: string;
  company: string;
  role: string;
  stage: string;
  followUpAt: string;
}

interface SerialisedActivity {
  id: string;
  action: import("@prisma/client").ActivityAction;
  applicationId: string | null;
  metadata: Record<string, string | null> | null;
  createdAt: string;
}

interface StageCount {
  stage: ApplicationStage;
  count: number;
}

interface DashboardClientProps {
  initialApplications: SerialisedApplication[];
  initialReminders: SerialisedReminder[];
  initialActivity: SerialisedActivity[];
  initialStageCounts: StageCount[];
  initialView: "list" | "kanban";
  greeting: string;
  userName: string;
}

type ViewMode = "list" | "kanban";

export default function DashboardClient({
  initialApplications,
  initialReminders,
  initialActivity,
  initialStageCounts,
  initialView,
  greeting,
  userName,
}: DashboardClientProps) {
  const [view, setView] = useState<ViewMode>(initialView);
  const [applications, setApplications] = useState(initialApplications);
  const [range, setRange] = useState<DateRange>(getPresetRange("all-time"));

  const params = rangeToParams(range);
  const queryString = params.from
    ? `?${new URLSearchParams(params as Record<string, string>)}`
    : "";

  const { data: metrics } = useSWR(
    `/api/dashboard/metrics${queryString}`,
    fetcher,
  );

  const handleStageChange = (id: string, newStage: ApplicationStage) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, stage: newStage } : app)),
    );
  };

  // Cast to satisfy KanbanBoard/ApplicationList which expect Prisma Application
  const appsForBoard =
    applications as unknown as import("@prisma/client").Application[];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {greeting}, {userName} 👋 · Here&apos;s what&apos;s happening with
              your job search.
            </p>
          </div>

          {/* Nav actions */}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              href="/dashboard/reminders"
              className="rounded-md border border-gray-300 bg-white px-3 py-2
                         text-sm font-medium text-gray-600 hover:bg-gray-50
                         dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300
                         dark:hover:bg-gray-700"
            >
              Reminders
            </Link>

            <Link
              href="/dashboard/resumes"
              className="rounded-md border border-gray-300 bg-white px-3 py-2
                         text-sm font-medium text-gray-600 hover:bg-gray-50
                         dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300
                         dark:hover:bg-gray-700"
            >
              Resumes
            </Link>

            <ExportButton />
            <Link
              href="/dashboard/applications/new"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium
             text-white hover:bg-indigo-700
             dark:bg-indigo-500 dark:hover:bg-indigo-600 whitespace-nowrap"
            >
              <span className="sm:hidden">+ New</span>
              <span className="hidden sm:inline">+ Add Application</span>
            </Link>
          </div>
        </div>

        {/* ── Pipeline Overview ── */}
        <PipelineBar stages={initialStageCounts} />

        {/* ── Stats ── */}
        <StatsBar applications={appsForBoard} />

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Left column — 60% */}
          <div className="space-y-6 lg:col-span-3">
            <UpcomingPanel reminders={initialReminders} />

            {/* Activity feed */}
            <div
              className="rounded-xl border border-gray-200 dark:border-gray-700
                             bg-white dark:bg-gray-800 p-6"
            >
              <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Recent Activity
              </h2>
              <ActivityFeed events={initialActivity} />
            </div>

            {/* List / Kanban view */}
            <div
              className="rounded-xl border border-gray-200 dark:border-gray-700
                             bg-white dark:bg-gray-800 p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Applications
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    {applications.length === 0
                      ? "None yet"
                      : `${applications.length} total`}
                  </span>
                </h2>

                {/* View toggle */}
                <div
                  className="flex rounded-md border border-gray-300 bg-white
                                dark:border-gray-600 dark:bg-gray-800"
                >
                  <button
                    onClick={() => setView("list")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-l-md transition-colors
                      ${
                        view === "list"
                          ? "bg-indigo-600 text-white dark:bg-indigo-500"
                          : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setView("kanban")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-r-md transition-colors
                      ${
                        view === "kanban"
                          ? "bg-indigo-600 text-white dark:bg-indigo-500"
                          : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                  >
                    Kanban
                  </button>
                </div>
              </div>

              {view === "list" ? (
                <ApplicationList applications={appsForBoard} />
              ) : (
                <KanbanBoard
                  applications={appsForBoard}
                  onStageChange={handleStageChange}
                />
              )}
            </div>
          </div>

          {/* Right column — 40% */}
          <div className="space-y-6 lg:col-span-2">
            <TasksPanel reminders={initialReminders} />

            {/* Date range filter + charts */}
            <div
              className="rounded-xl border border-gray-200 dark:border-gray-700
                             bg-white dark:bg-gray-800 p-6 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Analytics
                </h2>
                <DateRangePicker value={range} onChange={setRange} />
              </div>

              {metrics && metrics.stageCounts?.length > 0 && (
                <PipelineChartPanel stageCounts={metrics.stageCounts} />
              )}
              {metrics && (
                <ConversionChart conversionRates={metrics.conversionRates} />
              )}
              {metrics && metrics.timeInStage?.length > 0 && (
                <TimeInStageChart timeInStage={metrics.timeInStage} />
              )}
              {metrics && metrics.sourceEffectiveness?.length > 0 && (
                <SourceChart
                  sourceEffectiveness={metrics.sourceEffectiveness}
                />
              )}
              {!metrics && (
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Loading analytics…
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
