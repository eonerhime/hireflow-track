// __tests__/ConversionChart.test.tsx
import { render, screen } from "@testing-library/react";
import ConversionChart from "@/components/ConversionChart";
import { Application } from "@prisma/client";

const makeApp = (stage: string): Application =>
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
    stageEnteredAt: new Date(),
    appliedAt: new Date(),
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as Application;

describe("ConversionChart", () => {
  it("renders 0% when no applications", () => {
    render(<ConversionChart applications={[]} />);
    expect(screen.getAllByText("0%")).toHaveLength(2);
  });

  it("computes appliedToInterview correctly", () => {
    // 1 of 4 at interview or beyond = 25%; interviewToOffer = 0% (no offer)
    const apps = [
      makeApp("APPLIED"),
      makeApp("APPLIED"),
      makeApp("APPLIED"),
      makeApp("INTERVIEW"),
    ];
    render(<ConversionChart applications={apps} />);
    expect(screen.getByText("25%")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("computes interviewToOffer correctly", () => {
    // 3 at interview or beyond, 1 at offer or beyond = 33%
    // appliedToInterview = 75% (3 of 4)
    const apps = [
      makeApp("APPLIED"),
      makeApp("INTERVIEW"),
      makeApp("INTERVIEW"),
      makeApp("OFFER"),
    ];
    render(<ConversionChart applications={apps} />);
    expect(screen.getByText("75%")).toBeInTheDocument(); // appliedToInterview
    expect(screen.getByText("33%")).toBeInTheDocument(); // interviewToOffer
  });

  it("renders both rate labels", () => {
    render(<ConversionChart applications={[makeApp("APPLIED")]} />);
    expect(screen.getByText("Applied → Interview")).toBeInTheDocument();
    expect(screen.getByText("Interview → Offer")).toBeInTheDocument();
  });
});
