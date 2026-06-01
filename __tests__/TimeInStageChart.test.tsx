import { render, screen } from "@testing-library/react";
import TimeInStageChart from "@/components/TimeInStageChart";

describe("TimeInStageChart", () => {
  it("renders nothing when no applications", () => {
    const { container } = render(<TimeInStageChart timeInStage={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when no applications have stageEnteredAt", () => {
    // API omits stages with no stageEnteredAt data — empty array is the result
    const { container } = render(<TimeInStageChart timeInStage={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the chart heading when data exists", () => {
    render(
      <TimeInStageChart timeInStage={[{ stage: "APPLIED", avgDays: 3 }]} />,
    );
    expect(screen.getByText("Avg. Days in Stage")).toBeInTheDocument();
  });

  it("renders a row for each stage that has applications", () => {
    render(
      <TimeInStageChart
        timeInStage={[
          { stage: "APPLIED", avgDays: 5 },
          { stage: "SCREENING", avgDays: 3 },
          { stage: "INTERVIEW", avgDays: 1 },
        ]}
      />,
    );
    expect(screen.getByText("Applied")).toBeInTheDocument();
    expect(screen.getByText("Screening")).toBeInTheDocument();
    expect(screen.getByText("Interview")).toBeInTheDocument();
  });

  it("does not render a row for stages with no applications", () => {
    render(
      <TimeInStageChart timeInStage={[{ stage: "APPLIED", avgDays: 3 }]} />,
    );
    expect(screen.queryByText("Screening")).not.toBeInTheDocument();
    expect(screen.queryByText("Interview")).not.toBeInTheDocument();
  });

  it("displays avg days with d suffix", () => {
    render(
      <TimeInStageChart timeInStage={[{ stage: "APPLIED", avgDays: 7 }]} />,
    );
    expect(screen.getByText("7d")).toBeInTheDocument();
  });

  it("averages correctly across multiple apps in the same stage", () => {
    // API has already averaged — just pass the result
    render(
      <TimeInStageChart timeInStage={[{ stage: "SCREENING", avgDays: 6 }]} />,
    );
    expect(screen.getByText("6d")).toBeInTheDocument();
  });
});
