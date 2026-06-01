import { render, screen } from "@testing-library/react";
import ActivityFeed from "@/components/ActivityFeed";

const makeEvent = (overrides = {}) => ({
  id: "log-1",
  action: "APPLICATION_CREATED" as const,
  applicationId: "app-1",
  metadata: { company: "Acme Corp", role: "Senior Engineer", stage: "APPLIED" },
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe("ActivityFeed", () => {
  it("renders empty state when no events", () => {
    render(<ActivityFeed events={[]} />);
    expect(screen.getByText(/no activity yet/i)).toBeInTheDocument();
  });

  it("renders a list of activity events with human-readable labels", () => {
    render(<ActivityFeed events={[makeEvent()]} />);
    expect(
      screen.getByText(/you added senior engineer at acme corp/i),
    ).toBeInTheDocument();
  });
});
