// __tests__/TimeInStageChart.test.tsx
import { render, screen } from "@testing-library/react";
import TimeInStageChart from "@/components/TimeInStageChart";
import { Application } from "@prisma/client";

const makeApp = (stage: string, daysAgo: number): Application =>
  ({
    id: `app-${stage}-${Math.random()}`,
    stage,
    userId: "user-1",
    company: "Acme",
    role: "Engineer",
    location: null,
    salary: null,
    jobUrl: null,
    followUpAt: null,
    notes: null,
    source: null,
    stageEnteredAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    appliedAt: new Date(),
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as Application;

describe("TimeInStageChart", () => {
  it("renders nothing when no applications", () => {
    const { container } = render(<TimeInStageChart applications={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when no applications have stageEnteredAt", () => {
    const app = makeApp("APPLIED", 5);
    const appWithoutDate = {
      ...app,
      stageEnteredAt: null,
    } as unknown as Application;
    const { container } = render(
      <TimeInStageChart applications={[appWithoutDate]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders the chart heading when data exists", () => {
    render(<TimeInStageChart applications={[makeApp("APPLIED", 3)]} />);
    expect(screen.getByText("Avg. Days in Stage")).toBeInTheDocument();
  });

  it("renders a row for each stage that has applications", () => {
    const apps = [
      makeApp("APPLIED", 5),
      makeApp("SCREENING", 3),
      makeApp("INTERVIEW", 1),
    ];
    render(<TimeInStageChart applications={apps} />);
    expect(screen.getByText("Applied")).toBeInTheDocument();
    expect(screen.getByText("Screening")).toBeInTheDocument();
    expect(screen.getByText("Interview")).toBeInTheDocument();
  });

  it("does not render a row for stages with no applications", () => {
    render(<TimeInStageChart applications={[makeApp("APPLIED", 3)]} />);
    expect(screen.queryByText("Screening")).not.toBeInTheDocument();
    expect(screen.queryByText("Interview")).not.toBeInTheDocument();
  });

  it("displays avg days with d suffix", () => {
    // 7 days ago — avgDays should be 7
    render(<TimeInStageChart applications={[makeApp("APPLIED", 7)]} />);
    expect(screen.getByText("7d")).toBeInTheDocument();
  });

  it("averages correctly across multiple apps in the same stage", () => {
    // 4 days and 8 days = avg 6 days
    const apps = [makeApp("SCREENING", 4), makeApp("SCREENING", 8)];
    render(<TimeInStageChart applications={apps} />);
    expect(screen.getByText("6d")).toBeInTheDocument();
  });
});
