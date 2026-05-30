import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ExportButton from "@/components/ExportButton";

// Mock fetch
global.fetch = jest.fn();

describe("ExportButton", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the export button", () => {
    render(<ExportButton />);
    expect(
      screen.getByRole("button", { name: /export csv/i }),
    ).toBeInTheDocument();
  });

  it("shows loading state while export is in progress", async () => {
    (global.fetch as jest.Mock).mockReturnValue(
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              ok: true,
              blob: () => Promise.resolve(new Blob(["test"])),
            }),
          100,
        ),
      ),
    );

    render(<ExportButton />);
    fireEvent.click(screen.getByRole("button", { name: /export csv/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /exporting/i }),
      ).toBeInTheDocument();
    });
  });
});
