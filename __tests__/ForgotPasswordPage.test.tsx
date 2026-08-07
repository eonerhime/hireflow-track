import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordPage from "@/app/forgot-password/page";

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ message: "If an account exists..." }),
    }) as jest.Mock;
  });

  it("shows the generic confirmation after submitting, regardless of outcome", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    await user.type(
      screen.getByLabelText(/email address/i),
      "someone@example.com",
    );
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/if an account exists for that email/i),
      ).toBeInTheDocument();
    });
  });
});
