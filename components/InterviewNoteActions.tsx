// components/InterviewNoteActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApplicationStage } from "@prisma/client";

interface InterviewNoteActionsProps {
  noteId: string;
  initialContent: string;
  initialStage: ApplicationStage;
  stageLabels: Record<ApplicationStage, string>;
}

export default function InterviewNoteActions({
  noteId,
  initialContent,
  initialStage,
  stageLabels,
}: InterviewNoteActionsProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [stage, setStage] = useState<ApplicationStage>(initialStage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage, content }),
    });

    if (res.ok) {
      setEditing(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to update note");
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to delete note");
      setConfirmingDelete(false);
      setLoading(false);
    }
  };

  const inputClass = `w-full rounded-md border border-gray-300 px-3 py-2 text-sm
    bg-white text-gray-900 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-indigo-500
    dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100
    dark:placeholder-gray-500 dark:focus:ring-indigo-400`;

  // ── Edit mode ─────────────────────────────────────────────────────────────
  if (editing) {
    return (
      <div className="mt-2 space-y-3">
        <div>
          <label
            htmlFor={`edit-stage-${noteId}`}
            className="block text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            Stage
          </label>
          <select
            id={`edit-stage-${noteId}`}
            value={stage}
            onChange={(e) => setStage(e.target.value as ApplicationStage)}
            className={inputClass}
          >
            {Object.entries(stageLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={`edit-content-${noteId}`}
            className="block text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            Note
          </label>
          <textarea
            id={`edit-content-${noteId}`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className={`${inputClass} py-2`}
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={loading || !content.trim()}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium
                       text-white hover:bg-blue-700 disabled:opacity-50
                       dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {loading ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => {
              setContent(initialContent);
              setStage(initialStage);
              setEditing(false);
              setError(null);
            }}
            disabled={loading}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs
                       font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50
                       dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Delete confirmation ───────────────────────────────────────────────────
  if (confirmingDelete) {
    return (
      <div className="mt-2 flex items-center gap-2">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Delete this note?
        </p>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium
                     text-white hover:bg-red-700 disabled:opacity-50
                     dark:bg-red-500 dark:hover:bg-red-600"
        >
          {loading ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          onClick={() => {
            setConfirmingDelete(false);
            setError(null);
          }}
          disabled={loading}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs
                     font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50
                     dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }

  // ── View mode ─────────────────────────────────────────────────────────────
  return (
    <div className="mt-2 flex gap-2">
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-indigo-600 hover:text-indigo-500
                   dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        Edit
      </button>
      <button
        onClick={() => setConfirmingDelete(true)}
        className="text-xs text-red-600 hover:text-red-500
                   dark:text-red-400 dark:hover:text-red-300"
      >
        Delete
      </button>
    </div>
  );
}
