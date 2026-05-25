import { render, screen } from "@testing-library/react";
import ReminderList from "@/components/ReminderList";

const futureDate = new Date(Date.now() + 86400000).toISOString();
const pastDate = new Date(Date.now() - 86400000).toISOString();

const mockReminder = (overrides = {}) => ({
  id: "app-1",
  company: "Acme Corp",
  role: "Senior Engineer",
  stage: "SCREENING" as const,
  followUpAt: futureDate,
  ...overrides,
});

describe("ReminderList", () => {
  it("renders empty state when no reminders", () => {
    render(<ReminderList reminders={[]} />);
    expect(screen.getByText(/no upcoming reminders/i)).toBeInTheDocument();
  });

  it("renders a list of reminders", () => {
    render(<ReminderList reminders={[mockReminder()]} />);
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("shows overdue indicator for past followUpAt dates", () => {
    render(
      <ReminderList reminders={[mockReminder({ followUpAt: pastDate })]} />,
    );
    expect(screen.getByText(/follow-up overdue/i)).toBeInTheDocument();
  });
});