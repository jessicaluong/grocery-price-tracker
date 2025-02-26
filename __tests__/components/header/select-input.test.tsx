import SelectInput from "@/components/header/select-input";
import { render, screen, fireEvent } from "@testing-library/react";

describe("SelectInput", () => {
  const mockOnChange = jest.fn();
  const options = ["Option 1", "Option 2", "Option 3"] as const;

  it("renders with label and initial value", async () => {
    render(
      <SelectInput
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
