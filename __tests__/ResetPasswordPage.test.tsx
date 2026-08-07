import { render, screen } from "@testing-library/react";
import ResetPasswordPage from "@/app/reset-password/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({
    get: (key: string) => (key === "token" ? "abc123" : null),
  }),
}));

describe("ResetPasswordPage", () => {
  it("renders the new-password form when a token is present in the URL", () => {
    render(<ResetPasswordPage />);

    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
  });
});
