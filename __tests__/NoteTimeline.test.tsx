// __tests__/NoteTimeline.test.tsx
import { render, screen } from "@testing-library/react";
import NoteTimeline from "@/components/NoteTimeline";
import { ApplicationStage } from "@prisma/client";

jest.mock("@/components/InterviewNoteActions", () => ({
  __esModule: true,
  default: () => <div data-testid="note-actions" />,
}));

const stageLabels: Record<ApplicationStage, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  ASSESSMENT: "Assessment",
  OFFER: "Offer",
  CLOSED: "Closed",
};

const stageColours: Record<ApplicationStage, string> = {
  APPLIED: "bg-blue-100 text-blue-800",
  SCREENING: "bg-yellow-100 text-yellow-800",
  INTERVIEW: "bg-purple-100 text-purple-800",
  ASSESSMENT: "bg-orange-100 text-orange-800",
  OFFER: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-600",
};

const baseProps = { stageLabels, stageColours };

describe("NoteTimeline", () => {
  it("renders empty state when no notes", () => {
    render(<NoteTimeline notes={[]} {...baseProps} />);
    expect(screen.getByText("No interview notes yet.")).toBeInTheDocument();
  });

  it("renders a note with its stage label and content", () => {
    render(
      <NoteTimeline
        notes={[
          {
            id: "n1",
            stage: "SCREENING",
            content: "Good phone screen",
            createdAt: new Date("2026-04-25"),
          },
        ]}
        {...baseProps}
      />,
    );
    expect(screen.getByText("Screening")).toBeInTheDocument();
    expect(screen.getByText("Good phone screen")).toBeInTheDocument();
  });

  it("renders all notes passed to it", () => {
    render(
      <NoteTimeline
        notes={[
          {
            id: "n1",
            stage: "SCREENING",
            content: "First note",
            createdAt: new Date("2026-04-24"),
          },
          {
            id: "n2",
            stage: "OFFER",
            content: "Offer received",
            createdAt: new Date("2026-04-25"),
          },
        ]}
        {...baseProps}
      />,
    );
    expect(screen.getByText("First note")).toBeInTheDocument();
    expect(screen.getByText("Offer received")).toBeInTheDocument();
    expect(screen.getByText("Screening")).toBeInTheDocument();
    expect(screen.getByText("Offer")).toBeInTheDocument();
  });

  it("renders InterviewNoteActions for each note", () => {
    render(
      <NoteTimeline
        notes={[
          {
            id: "n1",
            stage: "SCREENING",
            content: "Note one",
            createdAt: new Date("2026-04-25"),
          },
          {
            id: "n2",
            stage: "INTERVIEW",
            content: "Note two",
            createdAt: new Date("2026-04-25"),
          },
        ]}
        {...baseProps}
      />,
    );
    expect(screen.getAllByTestId("note-actions")).toHaveLength(2);
  });

  it("renders notes in the order received (sort is caller's responsibility)", () => {
    render(
      <NoteTimeline
        notes={[
          {
            id: "n1",
            stage: "OFFER",
            content: "Offer note",
            createdAt: new Date("2026-04-25"),
          },
          {
            id: "n2",
            stage: "SCREENING",
            content: "Screening note",
            createdAt: new Date("2026-04-24"),
          },
        ]}
        {...baseProps}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Offer note");
    expect(items[1]).toHaveTextContent("Screening note");
  });
});
