import { render, screen } from "@testing-library/react";
import PipelineChart from "@/components/PipelineChart";
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

describe("PipelineChart", () => {
  it("shows empty state when no applications", () => {
    render(<PipelineChart applications={[]} />);
    expect(screen.getByText(/no applications yet/i)).toBeInTheDocument();
  });

  it("renders Pipeline Distribution heading when applications exist", () => {
    render(<PipelineChart applications={[mockApp("APPLIED")]} />);
    expect(screen.getByText(/pipeline distribution/i)).toBeInTheDocument();
  });

  it("renders legend with stage counts", () => {
    render(
      <PipelineChart applications={[mockApp("APPLIED"), mockApp("OFFER")]} />,
    );
    expect(screen.getByText(/applied \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/offer \(1\)/i)).toBeInTheDocument();
  });
});
