// components/ResumeList.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Resume {
  id: string;
  label: string;
  fileUrl: string;
  uploadedAt: string;
}

interface ResumeListProps {
  resumes: Resume[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ResumeList({ resumes }: ResumeListProps) {
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setConfirmingDelete(null);
      router.refresh();
    }
    setDeleting(false);
  };

  if (resumes.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No resumes uploaded yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
      {resumes.map((resume) => (
        <li
          key={resume.id}
          className="flex items-center justify-between gap-4 py-4"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-gray-900 dark:text-gray-100">
              {resume.label}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Uploaded {formatDate(resume.uploadedAt)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <a
              href={resume.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline
                         dark:text-blue-400 dark:hover:text-blue-300"
            >
              Download
            </a>
            {confirmingDelete === resume.id ? (
              <span className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  Delete?
                </span>
                <button
                  onClick={() => handleDelete(resume.id)}
                  disabled={deleting}
                  className="font-medium text-red-600 hover:underline disabled:opacity-50
                             dark:text-red-400"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setConfirmingDelete(null)}
                  className="text-gray-500 hover:underline dark:text-gray-400"
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmingDelete(resume.id)}
                className="text-sm text-red-600 hover:underline dark:text-red-400"
              >
                Delete
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
