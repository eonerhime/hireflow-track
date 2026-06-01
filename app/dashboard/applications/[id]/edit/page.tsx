// app/dashboard/applications/[id]/edit/page.tsx
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import ApplicationForm from "@/components/ApplicationForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface EditPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function EditApplicationPage({
  params,
  searchParams,
}: EditPageProps) {
  const { id } = await params;
  const { from } = await searchParams;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const backHref =
    from === "kanban"
      ? `/dashboard/applications/${id}?from=kanban`
      : from === "reminders"
        ? `/dashboard/applications/${id}?from=reminders`
        : `/dashboard/applications/${id}`;

  const application = await prisma.application.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!application) notFound();

  const defaultValues = {
    company: application.company,
    role: application.role,
    location: application.location ?? undefined,
    salary: application.salary ?? undefined,
    jobUrl: application.jobUrl ?? undefined,
    followUpAt: application.followUpAt
      ? application.followUpAt.toISOString().split("T")[0]
      : undefined,
    notes: application.notes ?? undefined,
    source:
      (application.source as
        | "LINKEDIN"
        | "REFERRAL"
        | "COLD_APPLY"
        | "JOB_BOARD"
        | "OTHER") ?? undefined,
    resumeVersionLabel: application.resumeVersionLabel ?? undefined,
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center text-sm text-gray-500
                   hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        ← Back to application
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Edit Application
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {application.role} at {application.company}
        </p>
      </div>
      <div
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm
                      dark:border-gray-700 dark:bg-gray-800"
      >
        <ApplicationForm
          mode="edit"
          applicationId={id}
          defaultValues={defaultValues}
          redirectTo={backHref}
        />
      </div>
    </main>
  );
}
