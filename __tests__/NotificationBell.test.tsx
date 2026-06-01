import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NotificationBell from "@/components/NotificationBell";

const futureDate = new Date(Date.now() + 86400000).toISOString();
const pastDate = new Date(Date.now() - 86400000).toISOString();

function mockFetch(reminders: object[]) {
  global.fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve(reminders),
  }) as jest.Mock;
}

describe("NotificationBell", () => {
  afterEach(() => jest.restoreAllMocks());

  it("renders without a badge when no reminders are overdue", async () => {
    mockFetch([
      {
        id: "1",
        company: "Acme",
        role: "Engineer",
        stage: "APPLIED",
        followUpAt: futureDate,
      },
    ]);
    render(<NotificationBell />);
    await waitFor(() => {
      expect(
        screen.queryByLabelText(/overdue reminders/i),
      ).not.toBeInTheDocument();
    });
  });

  it("shows correct badge count when overdue reminders exist", async () => {
    mockFetch([
      {
        id: "1",
        company: "Acme",
        role: "Engineer",
        stage: "APPLIED",
        followUpAt: pastDate,
      },
      {
        id: "2",
        company: "BetaCo",
        role: "PM",
        stage: "INTERVIEW",
        followUpAt: pastDate,
      },
    ]);
    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByLabelText(/2 overdue reminders/i)).toBeInTheDocument();
    });
  });

  it("opens dropdown with reminder items when bell is clicked", async () => {
    mockFetch([
      {
        id: "1",
        company: "Acme Corp",
        role: "Senior Engineer",
        stage: "APPLIED",
        followUpAt: futureDate,
      },
    ]);
    render(<NotificationBell />);
    await waitFor(() => screen.getByRole("button"));
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    });
  });
});
