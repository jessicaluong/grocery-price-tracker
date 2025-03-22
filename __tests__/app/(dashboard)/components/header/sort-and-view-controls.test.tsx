import { render, screen, fireEvent } from "@testing-library/react";
import SortAndViewControls from "@/app/(dashboard)/groceries/components/header/sort-and-view-controls";
import { useUrlParams } from "@/hooks/use-url-params";
import { SORT_OPTIONS, VIEW_OPTIONS } from "@/lib/constants";

jest.mock("@/hooks/use-url-params", () => ({
  useUrlParams: jest.fn(),
}));

jest.mock(
  "@/app/(dashboard)/groceries/components/header/sort-and-view-select",
  () => {
    return function MockSortAndViewSelect({
      label,
      options,
      value,
      onChange,
    }: {
      label: string;
      options: readonly string[];
      value: string;
      onChange: (value: string) => void;
    }) {
      return (
        <div data-testid={`select-${label.toLowerCase()}`}>
          <span>
            {label} {value}
          </span>
          <select
            data-testid={`${label.toLowerCase()}-select`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    };
  }
);

describe("SortAndViewControls", () => {
  const mockUpdateParam = jest.fn();
  const mockGetDisplayValue = jest.fn();

  beforeEach(() => {
    mockGetDisplayValue.mockImplementation((type, paramName, defaultValue) => {
      if (type === "sort") return SORT_OPTIONS.NEWEST.display;
      if (type === "view") return VIEW_OPTIONS.LIST.display;
      return defaultValue;
    });

    (useUrlParams as jest.Mock).mockReturnValue({
      updateParam: mockUpdateParam,
      getDisplayValue: mockGetDisplayValue,
    });
  });

  it("renders sort and view selects with default values", () => {
    render(<SortAndViewControls />);

    expect(
      screen.getByText(`Sort ${SORT_OPTIONS.NEWEST.display}`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`View ${VIEW_OPTIONS.LIST.display}`)
    ).toBeInTheDocument();
  });

  it("renders with custom values from URL parameters", () => {
    mockGetDisplayValue.mockImplementation((type, paramName, defaultValue) => {
      if (type === "sort") return SORT_OPTIONS.CHEAPEST.display;
      if (type === "view") return VIEW_OPTIONS.GROUP.display;
      return defaultValue;
    });

    render(<SortAndViewControls />);

    expect(
      screen.getByText(`Sort ${SORT_OPTIONS.CHEAPEST.display}`)
    ).toBeInTheDocument();

    expect(
      screen.getByText(`View ${VIEW_OPTIONS.GROUP.display}`)
    ).toBeInTheDocument();
  });

  it("calls updateParam when sort option changes", () => {
    render(<SortAndViewControls />);

    const sortSelect = screen.getByTestId("sort-select");
    fireEvent.change(sortSelect, {
      target: { value: SORT_OPTIONS.CHEAPEST.display },
    });

    expect(mockUpdateParam).toHaveBeenCalledWith(
      "sort",
      "sort",
      SORT_OPTIONS.CHEAPEST.display
    );
  });

  it("calls updateParam when view option changes", () => {
    render(<SortAndViewControls />);

    const viewSelect = screen.getByTestId("view-select");
    fireEvent.change(viewSelect, {
      target: { value: VIEW_OPTIONS.GROUP.display },
    });

    expect(mockUpdateParam).toHaveBeenCalledWith(
      "view",
      "view",
      VIEW_OPTIONS.GROUP.display
    );
  });
});
