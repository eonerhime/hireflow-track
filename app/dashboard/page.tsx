// app/dashboard/page.tsx
import DashboardClient from "@/components/DashboardClient";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, firstName: true, lastName: true },
  });
  const { from } = await searchParams;

  const userName = user?.firstName ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const [applications, reminders, activity] = await Promise.all([
    prisma.application.findMany({
      where: { userId: session.user.id, deletedAt: null },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.application.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
        followUpAt: { not: null },
      },
      select: {
        id: true,
        company: true,
        role: true,
        stage: true,
        followUpAt: true,
      },
      orderBy: { followUpAt: "asc" },
    }),
    prisma.activityLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  // Serialise dates to strings for client components
  const serialisedApplications = applications.map((a) => ({
    ...a,
    appliedAt: a.appliedAt.toISOString(),
    followUpAt: a.followUpAt?.toISOString() ?? null,
    stageEnteredAt: a.stageEnteredAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    deletedAt: a.deletedAt?.toISOString() ?? null,
  }));

  const serialisedReminders = reminders.map((r) => ({
    ...r,
    followUpAt: r.followUpAt!.toISOString(),
  }));

  const serialisedActivity = activity.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
    metadata: (a.metadata ?? null) as Record<string, string | null> | null,
  }));

  const stageCounts = (
    [
      "APPLIED",
      "SCREENING",
      "INTERVIEW",
      "ASSESSMENT",
      "OFFER",
      "CLOSED",
    ] as const
  ).map((stage) => ({
    stage,
    count: applications.filter((a) => a.stage === stage).length,
  }));

  return (
    <DashboardClient
      initialApplications={serialisedApplications}
      initialReminders={serialisedReminders}
      initialActivity={serialisedActivity}
      initialStageCounts={stageCounts}
      initialView={from === "kanban" ? "kanban" : "list"}
      greeting={greeting}
      userName={userName}
    />
  );
}
