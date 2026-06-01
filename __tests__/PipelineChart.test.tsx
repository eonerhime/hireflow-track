import { render, screen } from "@testing-library/react";
import PipelineChart from "@/components/PipelineChart";

describe("PipelineChart", () => {
  it("shows empty state when no applications", () => {
    render(<PipelineChart stageCounts={[]} />);
    expect(screen.getByText(/no applications yet/i)).toBeInTheDocument();
  });

  it("renders Pipeline Distribution heading when applications exist", () => {
    render(<PipelineChart stageCounts={[{ stage: "APPLIED", count: 1 }]} />);
    expect(screen.getByText(/pipeline distribution/i)).toBeInTheDocument();
  });

  it("renders legend with stage counts", () => {
    render(
      <PipelineChart
        stageCounts={[
          { stage: "APPLIED", count: 1 },
          { stage: "OFFER", count: 1 },
        ]}
      />,
    );
    expect(screen.getByText(/applied \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/offer \(1\)/i)).toBeInTheDocument();
  });
});
