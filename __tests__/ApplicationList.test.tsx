import { render, screen } from "@testing-library/react";
import ApplicationList from "@/components/ApplicationList";
import { Application, ApplicationStage } from "@prisma/client";

const mockApp = (overrides?: Partial<Application>): Application => ({
  id: "app-1",
  userId: "user-1",
  company: "Acme Corp",
  role: "Senior Engineer",
  location: "Remote",
  salary: "£70k",
  jobUrl: null,
  stage: "APPLIED" as ApplicationStage,
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
  ...overrides,
});

describe("ApplicationList", () => {
  it("shows empty state when no applications", () => {
    render(<ApplicationList applications={[]} />);
    expect(screen.getByText(/no applications yet/i)).toBeInTheDocument();
    expect(screen.getByText(/add your first application/i)).toBeInTheDocument();
  });

  it("renders application cards", () => {
    render(<ApplicationList applications={[mockApp()]} />);
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("renders multiple cards", () => {
    const apps = [
      mockApp({ id: "1", role: "Engineer" }),
      mockApp({ id: "2", role: "Designer", company: "Beta Inc" }),
    ];
    render(<ApplicationList applications={apps} />);
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("shows overdue indicator when followUpAt is past", () => {
    const pastDate = new Date(Date.now() - 86400000); // yesterday
    render(
      <ApplicationList applications={[mockApp({ followUpAt: pastDate })]} />,
    );
    expect(screen.getByText(/follow-up overdue/i)).toBeInTheDocument();
  });
});
