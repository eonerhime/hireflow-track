import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ApplicationList from "@/components/ApplicationList";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id, deletedAt: null },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Applications
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {applications.length === 0
              ? "No applications yet"
              : `${applications.length} application${applications.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link
          href="/dashboard/applications/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium
                     text-white hover:bg-indigo-700
                     dark:bg-indigo-500 dark:hover:bg-indigo-600 whitespace-nowrap"
        >
          + Add Application
        </Link>
      </div>

      <div
        className="rounded-xl border border-gray-200 dark:border-gray-700
                      bg-white dark:bg-gray-800 p-6"
      >
        <ApplicationList applications={applications} />
      </div>
    </div>
  );
}
