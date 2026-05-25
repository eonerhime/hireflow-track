import { render, screen } from "@testing-library/react";
import StatsBar from "@/components/StatsBar";
import { Application, ApplicationStage } from "@prisma/client";

const mockApp = (stage: ApplicationStage): Application => ({
  id: `app-${stage}`,
  userId: "user-1",
  company: "Acme",
  role: "Engineer",
  location: null,
  salary: null,
  jobUrl: null,
  stage,
  appliedAt: new Date(),
  followUpAt: null,
  notes: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  source: null,
  resumeVersionLabel: null,
  resumeId: null,
  stageEnteredAt: new Date(),
});

describe("StatsBar", () => {
  it("renders all four stat labels", () => {
    render(<StatsBar applications={[]} />);
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Interviews")).toBeInTheDocument();
    expect(screen.getByText("Offers")).toBeInTheDocument();
  });

  it("renders correct total count", () => {
    render(<StatsBar applications={[mockApp("APPLIED"), mockApp("OFFER")]} />);
    const values = screen.getAllByText("2");
    expect(values.length).toBeGreaterThan(0);
  });

  it("excludes CLOSED from active count", () => {
    render(<StatsBar applications={[mockApp("APPLIED"), mockApp("CLOSED")]} />);
    const activeLabel = screen.getByText("Active");
    expect(activeLabel.previousSibling?.textContent).toBe("1");
  });
});
