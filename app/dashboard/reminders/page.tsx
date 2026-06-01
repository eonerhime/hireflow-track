// app/dashboard/reminders/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import ReminderList from "@/components/ReminderList";

export const dynamic = "force-dynamic";

async function getReminders(userId: string) {
  return prisma.application.findMany({
    where: { userId, deletedAt: null, followUpAt: { not: null } },
    select: {
      id: true,
      company: true,
      role: true,
      stage: true,
      followUpAt: true,
    },
    orderBy: { followUpAt: "asc" },
  });
}

export default async function RemindersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const reminders = (await getReminders(session.user.id)).map((r) => ({
    ...r,
    followUpAt: r.followUpAt?.toISOString() ?? "",
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center text-sm text-gray-500
                   hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        ← Back to Dashboard
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Reminders
      </h1>

      <div
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm
                      dark:border-gray-700 dark:bg-gray-800"
      >
        <ReminderList reminders={reminders} />
      </div>
    </div>
  );
}
