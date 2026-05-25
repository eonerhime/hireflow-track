// app/dashboard/applications/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ApplicationForm from "@/components/ApplicationForm";
import Link from "next/link";

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

  const backHref =
    from === "kanban"
      ? `/dashboard/applications/${id}?from=kanban`
      : from === "reminders"
        ? `/dashboard/applications/${id}?from=reminders`
        : `/dashboard/applications/${id}`;

  const backLabel = "← Back to application";

  // Get userId from cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("hiretrace-token")?.value;
  if (!token) redirect("/login");

  let userId: string;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    userId = payload.userId as string;
  } catch {
    redirect("/login");
  }

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
               hover:text-gray-700"
      >
        {backLabel}
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Edit Application
        </h1>
        ...
        <p className="mt-1 text-sm text-gray-500">
          {application.role} at {application.company}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <ApplicationForm
          mode="edit"
          applicationId={id}
          defaultValues={defaultValues}
        />
      </div>
    </main>
  );
}
