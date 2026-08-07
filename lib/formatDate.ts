// lib/formatDate.ts
//
// Shared display-date formatter — was duplicated verbatim across
// NoteTimeline, NoteViewToggle, ReminderList, and ResumeList.
export function formatDate(iso: string | Date): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
