// components/NoteTimeline.tsx
"use client";

import { ApplicationStage } from "@prisma/client";
import InterviewNoteActions from "@/components/InterviewNoteActions";

interface Note {
  id: string;
  stage: ApplicationStage;
  content: string;
  createdAt: Date;
}

interface NoteTimelineProps {
  notes: Note[];
  stageLabels: Record<ApplicationStage, string>;
  stageColours: Record<ApplicationStage, string>;
}

export default function NoteTimeline({
  notes,
  stageLabels,
  stageColours,
}: NoteTimelineProps) {
  if (notes.length === 0) {
    return <p className="text-sm text-gray-500">No interview notes yet.</p>;
  }

  // Chronological, newest first — already ordered by the Prisma query
  return (
    <ol className="relative border-l border-gray-200">
      {notes.map((note) => (
        <li key={note.id} className="mb-6 ml-4">
          {/* Timeline dot */}
          <span
            className={`absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border
                        border-white ${stageColours[note.stage].split(" ")[0]}`}
          />

          {/* Stage badge + date */}
          <p className="mb-1 text-xs font-medium text-gray-500">
            <span
              className={`mr-2 rounded-full px-2 py-0.5 text-xs font-medium
                          ${stageColours[note.stage]}`}
            >
              {stageLabels[note.stage]}
            </span>
            {new Date(note.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>

          {/* Note content */}
          <p className="whitespace-pre-wrap text-sm text-gray-900">
            {note.content}
          </p>

          {/* Edit / Delete */}
          <InterviewNoteActions
            noteId={note.id}
            initialContent={note.content}
            initialStage={note.stage}
            stageLabels={stageLabels}
          />
        </li>
      ))}
    </ol>
  );
}
