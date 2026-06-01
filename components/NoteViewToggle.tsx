// components/NoteViewToggle.tsx
"use client";

import { useState } from "react";
import { ApplicationStage } from "@prisma/client";
import InterviewNoteForm from "@/components/InterviewNoteForm";
import InterviewNoteActions from "@/components/InterviewNoteActions";
import NoteTimeline from "@/components/NoteTimeline";

interface Note {
  id: string;
  stage: ApplicationStage;
  content: string;
  createdAt: Date;
}

interface NoteViewToggleProps {
  notes: Note[];
  applicationId: string;
  currentStage: ApplicationStage;
  stageLabels: Record<ApplicationStage, string>;
  stageColours: Record<ApplicationStage, string>;
}

const STAGE_ORDER: ApplicationStage[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "ASSESSMENT",
  "OFFER",
  "CLOSED",
];

function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    const stageDiff =
      STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage);
    if (stageDiff !== 0) return stageDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export default function NoteViewToggle({
  notes,
  applicationId,
  currentStage,
  stageLabels,
  stageColours,
}: NoteViewToggleProps) {
  const [view, setView] = useState<"list" | "timeline">("list");
  const sorted = sortNotes(notes);

  return (
    <>
      {/* Toggle */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Interview Notes
        </h2>
        <div
          className="flex gap-1 rounded-md border border-gray-200 p-0.5
                        dark:border-gray-700"
        >
          {(["list", "timeline"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors
                ${
                  view === v
                    ? "bg-indigo-600 text-white dark:bg-indigo-500"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
            >
              {v === "list" ? "List" : "Timeline"}
            </button>
          ))}
        </div>
      </div>

      {/* List view */}
      {view === "list" && (
        <>
          {sorted.length > 0 ? (
            <ul className="mb-4 space-y-3">
              {sorted.map((note) => (
                <li
                  key={note.id}
                  className="rounded-md border border-gray-100 bg-gray-50 p-3
                             dark:border-gray-700 dark:bg-gray-700/50"
                >
                  <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                    {stageLabels[note.stage]} ·{" "}
                    {new Date(note.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
                    {note.content}
                  </p>
                  <InterviewNoteActions
                    noteId={note.id}
                    initialContent={note.content}
                    initialStage={note.stage}
                    stageLabels={stageLabels}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              No interview notes yet.
            </p>
          )}
        </>
      )}

      {/* Timeline view */}
      {view === "timeline" && (
        <div className="mb-4">
          <NoteTimeline
            notes={sorted}
            stageLabels={stageLabels}
            stageColours={stageColours}
          />
        </div>
      )}

      {/* Add note form */}
      <div className="border-t border-gray-100 pt-4 dark:border-gray-700">
        <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          Add Note
        </h3>
        <InterviewNoteForm
          applicationId={applicationId}
          currentStage={currentStage}
        />
      </div>
    </>
  );
}
