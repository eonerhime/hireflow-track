import { render, screen, fireEvent } from "@testing-library/react";
import ResumeList from "@/components/ResumeList";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }),
}));

const mockResumes = [
  {
    id: "resume-1",
    label: "PM Resume v3",
    fileUrl: "https://res.cloudinary.com/example/resume.pdf",
    uploadedAt: new Date().toISOString(),
  },
];

// Mock fetch — ResumeList calls DELETE /api/resumes/[id] on confirm
global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
) as jest.Mock;

describe("ResumeList — delete confirmation", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows inline delete confirmation when delete button is clicked", () => {
    render(<ResumeList resumes={mockResumes} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(screen.getByText("Delete?")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /yes, delete/i }),
    ).toBeInTheDocument();
  });

  it("hides confirmation and returns to normal state when cancel is clicked", () => {
    render(<ResumeList resumes={mockResumes} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByText("Delete?")).not.toBeInTheDocument();
  });
});
