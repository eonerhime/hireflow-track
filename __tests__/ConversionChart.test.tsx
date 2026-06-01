import { render, screen } from "@testing-library/react";
import ConversionChart from "@/components/ConversionChart";

describe("ConversionChart", () => {
  it("renders 0% when no applications", () => {
    render(
      <ConversionChart
        conversionRates={{ appliedToInterview: 0, interviewToOffer: 0 }}
      />,
    );
    expect(screen.getAllByText("0%")).toHaveLength(2);
  });

  it("computes appliedToInterview correctly", () => {
    // 1 of 4 at interview or beyond = 25%; interviewToOffer = 0%
    render(
      <ConversionChart
        conversionRates={{ appliedToInterview: 25, interviewToOffer: 0 }}
      />,
    );
    expect(screen.getByText("25%")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("computes interviewToOffer correctly", () => {
    // appliedToInterview = 75%, interviewToOffer = 33%
    render(
      <ConversionChart
        conversionRates={{ appliedToInterview: 75, interviewToOffer: 33 }}
      />,
    );
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("33%")).toBeInTheDocument();
  });

  it("renders both rate labels", () => {
    render(
      <ConversionChart
        conversionRates={{ appliedToInterview: 0, interviewToOffer: 0 }}
      />,
    );
    expect(screen.getByText("Applied → Interview")).toBeInTheDocument();
    expect(screen.getByText("Interview → Offer")).toBeInTheDocument();
  });
});
