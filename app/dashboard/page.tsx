import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/DashboardClient";

async function getCurrentUserId(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("hiretrace-token")?.value;
  if (!token) redirect("/login");
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as string;
  } catch {
    redirect("/login");
  }
}

interface DashboardPageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const { from } = await searchParams;
  const userId = await getCurrentUserId();

  const applications = await prisma.application.findMany({
    where: { userId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <DashboardClient
      initialApplications={applications}
      initialView={from === "kanban" ? "kanban" : "list"}
    />
  );
}
