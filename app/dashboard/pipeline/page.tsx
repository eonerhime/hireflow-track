// app/dashboard/pipeline/page.tsx
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import PipelineClient from "@/components/PipelineClient";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
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
            Pipeline
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Drag and drop to update application stages
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

      <PipelineClient applications={applications} />
    </div>
  );
}
