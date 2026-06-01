import { render, screen, fireEvent } from "@testing-library/react";
import DateRangePicker from "@/components/DateRangePicker";
import { getPresetRange } from "@/lib/dateRange";

const noop = jest.fn();

describe("DateRangePicker", () => {
  it("renders with default This Month label", () => {
    render(
      <DateRangePicker value={getPresetRange("this-month")} onChange={noop} />,
    );
    // Label should show the current month's date range
    const button = screen.getByRole("button");
    expect(button.textContent).toMatch(/\w+ \d+ – \w+ \d+, \d{4}/);
  });

  it("clicking This Week preset calls onChange with week range", () => {
    const onChange = jest.fn();
    render(
      <DateRangePicker
        value={getPresetRange("this-month")}
        onChange={onChange}
      />,
    );
    // Open picker
    fireEvent.click(screen.getByRole("button"));
    // Click This Week preset
    fireEvent.click(screen.getByText("This Week"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ from: expect.any(Date) }),
    );
  });
});
