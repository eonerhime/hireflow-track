import { render, screen } from "@testing-library/react";
import ResumeUploadForm from "@/components/ResumeUploadForm";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

describe("ResumeUploadForm", () => {
  it("renders label and file inputs", () => {
    render(<ResumeUploadForm />);
    expect(screen.getByLabelText(/label/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pdf file/i)).toBeInTheDocument();
  });

  it("renders the upload button", () => {
    render(<ResumeUploadForm />);
    expect(
      screen.getByRole("button", { name: /upload resume/i }),
    ).toBeInTheDocument();
  });

  it("upload button is disabled when no file or label provided", () => {
    render(<ResumeUploadForm />);
    expect(
      screen.getByRole("button", { name: /upload resume/i }),
    ).toBeDisabled();
  });
});
