// app/dashboard/resumes/page.tsx
import ResumeList from "@/components/ResumeList";
import ResumeUploadForm from "@/components/ResumeUploadForm";
import { cookies } from "next/headers";
import Link from "next/link";

async function getResumes() {
  const cookieStore = await cookies();
  const token = cookieStore.get("hiretrace-token")?.value;

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/resumes`, {
    headers: { Cookie: `hiretrace-token=${token}` },
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
}

export default async function ResumesPage() {
  const resumes = await getResumes();

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Resumes</h1>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">
          Upload a resume
        </h2>
        <ResumeUploadForm />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">
          Uploaded resumes
        </h2>
        <ResumeList resumes={resumes} />
      </section>
    </div>
  );
}
