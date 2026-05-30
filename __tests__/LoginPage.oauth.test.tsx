import { render, screen } from "@testing-library/react";
import LoginPage from "@/app/login/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
  useSession: () => ({ data: null, status: "unauthenticated" }),
}));

describe("LoginPage", () => {
  it("renders the Google OAuth button", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
  });
});
