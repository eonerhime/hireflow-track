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

  const { from } = await searchParams;

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id, deletedAt: null },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <DashboardClient
        initialApplications={applications}
        initialView={from === "kanban" ? "kanban" : "list"}
      />
    </div>
  );
}
