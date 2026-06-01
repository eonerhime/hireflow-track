import { render, screen } from "@testing-library/react";
import PipelineBar from "@/components/PipelineBar";
import UpcomingPanel from "@/components/UpcomingPanel";
import TasksPanel from "@/components/TasksPanel";

const STAGE_COUNTS = [
  { stage: "APPLIED" as const, count: 5 },
  { stage: "SCREENING" as const, count: 3 },
  { stage: "INTERVIEW" as const, count: 2 },
  { stage: "ASSESSMENT" as const, count: 1 },
  { stage: "OFFER" as const, count: 1 },
  { stage: "CLOSED" as const, count: 0 },
];

describe("PipelineBar", () => {
  it("renders all 6 stage labels", () => {
    render(<PipelineBar stages={STAGE_COUNTS} />);
    expect(screen.getByText("Applied")).toBeInTheDocument();
    expect(screen.getByText("Interview")).toBeInTheDocument();
    expect(screen.getByText("Hired")).toBeInTheDocument();
  });
});

describe("UpcomingPanel", () => {
  it("renders reminder items", () => {
    const reminders = [
      {
        id: "r1",
        company: "Acme",
        role: "Engineer",
        stage: "INTERVIEW",
        followUpAt: new Date(Date.now() + 86400000).toISOString(),
      },
    ];
    render(<UpcomingPanel reminders={reminders} />);
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText(/view all reminders/i)).toBeInTheDocument();
  });
});

describe("TasksPanel", () => {
  it("renders progress bar and task list", () => {
    const reminders = [
      {
        id: "r1",
        company: "Acme",
        role: "Engineer",
        followUpAt: new Date(Date.now() - 86400000).toISOString(),
      }, // overdue
      {
        id: "r2",
        company: "BetaCo",
        role: "PM",
        followUpAt: new Date(Date.now() + 86400000).toISOString(),
      }, // future
    ];
    render(<TasksPanel reminders={reminders} />);
    expect(screen.getByText(/1 \/ 2 on track/i)).toBeInTheDocument();
  });
});
