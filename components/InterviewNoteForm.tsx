// components/InterviewNoteForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApplicationStage } from "@prisma/client";

interface InterviewNoteFormProps {
  applicationId: string;
  currentStage: ApplicationStage;
}

const STAGE_LABELS: Record<ApplicationStage, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  ASSESSMENT: "Assessment",
  OFFER: "Offer",
  CLOSED: "Closed",
};

export default function InterviewNoteForm({
  applicationId,
  currentStage,
}: InterviewNoteFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [stage, setStage] = useState<ApplicationStage>(currentStage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/applications/${applicationId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage, content }),
    });

    if (res.ok) {
      setContent("");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to save note");
    }

    setLoading(false);
  };

  const inputClass = `w-full rounded-md border border-gray-300 px-3 py-2 text-sm
    bg-white text-gray-900 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-indigo-500
    dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100
    dark:placeholder-gray-500 dark:focus:ring-indigo-400`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="note-stage"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Stage
        </label>
        <select
          id="note-stage"
          value={stage}
          onChange={(e) => setStage(e.target.value as ApplicationStage)}
          className={inputClass}
        >
          {Object.entries(STAGE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="note-content"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Note
        </label>
        <textarea
          id="note-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Add a note for this stage..."
          className={inputClass}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium
                   text-white hover:bg-blue-700 disabled:opacity-50
                   dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        {loading ? "Saving…" : "Save Note"}
      </button>
    </form>
  );
}
