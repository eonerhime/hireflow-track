// app/dashboard/resumes/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ResumeList from "@/components/ResumeList";
import ResumeUploadForm from "@/components/ResumeUploadForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getResumes(userId: string) {
  return prisma.resume.findMany({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
    select: { id: true, label: true, fileUrl: true, uploadedAt: true },
  });
}

export default async function ResumesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const resumes = (await getResumes(session.user.id)).map((r) => ({
    ...r,
    uploadedAt: r.uploadedAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center text-sm text-gray-500
                   hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        ← Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Resumes
      </h1>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
          Upload a resume
        </h2>
        <div
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm
                        dark:border-gray-700 dark:bg-gray-800"
        >
          <ResumeUploadForm />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
          Uploaded resumes
        </h2>
        <div
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm
                        dark:border-gray-700 dark:bg-gray-800"
        >
          <ResumeList resumes={resumes} />
        </div>
      </section>
    </div>
  );
}
