import { render, screen } from "@testing-library/react";
import KanbanBoard from "@/components/KanbanBoard";
import { ApplicationStage } from "@prisma/client";

// Minimal application shape for Kanban rendering
const makeApp = (
  overrides: Partial<{
    id: string;
    company: string;
    role: string;
    stage: ApplicationStage;
  }> = {},
) => ({
  id: "app-1",
  company: "Acme Corp",
  role: "Senior Engineer",
  stage: "APPLIED" as ApplicationStage,
  location: null,
  salary: null,
  jobUrl: null,
  followUpAt: null,
  notes: null,
  source: null,
  resumeVersionLabel: null,
  resumeId: null,
  appliedAt: new Date(),
  stageEnteredAt: new Date(),
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: "user-1",
  ...overrides,
});

describe("KanbanBoard", () => {
  it("renders a column for each of the 6 pipeline stages", () => {
    render(<KanbanBoard applications={[]} onStageChange={() => {}} />);
    expect(screen.getByText("Applied")).toBeInTheDocument();
    expect(screen.getByText("Screening")).toBeInTheDocument();
    expect(screen.getByText("Interview")).toBeInTheDocument();
    expect(screen.getByText("Assessment")).toBeInTheDocument();
    expect(screen.getByText("Offer")).toBeInTheDocument();
    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("renders an application card in the correct stage column", () => {
    const app = makeApp({
      stage: "INTERVIEW",
      role: "Product Manager",
      company: "BetaCo",
    });
    render(<KanbanBoard applications={[app]} onStageChange={() => {}} />);
    expect(screen.getByText("Product Manager")).toBeInTheDocument();
    expect(screen.getByText("BetaCo")).toBeInTheDocument();
  });
});
