import SortAndViewSelect from "@/components/header/sort-and-view-select";
import { render, screen } from "@testing-library/react";

describe("SortAndViewSelectInput", () => {
  const mockOnChange = jest.fn();
  const options = ["Option 1", "Option 2", "Option 3"] as const;

  it("renders with label and initial value", async () => {
    render(
      <SortAndViewSelect
        label="Test Label"
        options={options}
        value={options[0]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveTextContent(options[0]);
  });
});
