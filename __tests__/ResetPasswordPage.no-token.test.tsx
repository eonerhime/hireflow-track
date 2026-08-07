import { render, screen } from "@testing-library/react";
import ResetPasswordPage from "@/app/reset-password/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

describe("ResetPasswordPage without a token", () => {
  it("shows a message instead of the form when no token is in the URL", () => {
    render(<ResetPasswordPage />);
    expect(screen.getByText(/missing or malformed/i)).toBeInTheDocument();
  });
});
