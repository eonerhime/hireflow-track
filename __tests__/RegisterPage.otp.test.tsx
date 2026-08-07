import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "@/app/register/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ message: "Verification code sent" }),
    }) as jest.Mock;
  });

  it("switches to the OTP step after a successful registration submit", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(
      screen.getByLabelText(/email address/i),
      "new@example.com",
    );
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(
      screen.getByLabelText(/confirm password/i),
      "password123",
    );
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /verify your email/i }),
      ).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
    expect(screen.getByText(/new@example.com/i)).toBeInTheDocument();
  });
});
