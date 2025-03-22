import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SearchBar } from "@/app/(dashboard)/groceries/components/header/search-bar";
import { useUrlParams } from "@/hooks/use-url-params";

jest.mock("@/hooks/use-url-params", () => ({
  useUrlParams: jest.fn(),
}));

describe("SearchBar", () => {
  const mockUpdateParam = jest.fn();
  const mockGetParam = jest.fn();

  beforeEach(() => {
    (useUrlParams as jest.Mock).mockReturnValue({
      updateParam: mockUpdateParam,
      getParam: mockGetParam,
    });
  });

  it("renders correctly with empty initial value", () => {
    render(<SearchBar />);

    const inputElement = screen.getByPlaceholderText(
      "Search by item name and brand"
    );
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveValue("");
  });

  it("renders with initial value from URL params", () => {
    mockGetParam.mockImplementation((name, defaultValue) => {
      return name === "query" ? "apple" : defaultValue;
    });

    render(<SearchBar />);

    const inputElement = screen.getByPlaceholderText(
      "Search by item name and brand"
    );
    expect(inputElement).toHaveValue("apple");
  });

  it("updates input value when user types", () => {
    render(<SearchBar />);

    const inputElement = screen.getByPlaceholderText(
      "Search by item name and brand"
    );
    fireEvent.change(inputElement, { target: { value: "orange" } });

    expect(inputElement).toHaveValue("orange");
  });

  it("debounces search and updates URL parameter after user input", async () => {
    jest.useFakeTimers();

    render(<SearchBar />);

    const inputElement = screen.getByPlaceholderText(
      "Search by item name and brand"
    );
    fireEvent.change(inputElement, { target: { value: "orange" } });

    // Verify the input value changes immediately
    expect(inputElement).toHaveValue("orange");

    // Verify that updateParam hasn't been called yet (before debounce timeout)
    expect(mockUpdateParam).not.toHaveBeenCalled();

    // Fast-forward time to trigger the debounced function
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Verify updateParam was called with the correct parameters
    expect(mockUpdateParam).toHaveBeenCalledWith("search", "query", "orange");

    jest.useRealTimers();
  });

  it("debounces multiple rapid inputs and only updates URL with final value", async () => {
    jest.useFakeTimers();

    render(<SearchBar />);

    const inputElement = screen.getByPlaceholderText(
      "Search by item name and brand"
    );

    // Type "or" initially
    fireEvent.change(inputElement, { target: { value: "or" } });

    // Type "ora" quickly after
    act(() => {
      jest.advanceTimersByTime(100);
    });
    fireEvent.change(inputElement, { target: { value: "ora" } });

    // Type "orange" quickly after
    act(() => {
      jest.advanceTimersByTime(100);
    });
    fireEvent.change(inputElement, { target: { value: "orange" } });

    // At this point, no updateParam should have been called yet
    expect(mockUpdateParam).not.toHaveBeenCalled();

    // Advance time to trigger the final debounced call
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Verify updateParam was called only once with the final value
    expect(mockUpdateParam).toHaveBeenCalledTimes(1);
    expect(mockUpdateParam).toHaveBeenCalledWith("search", "query", "orange");

    jest.useRealTimers();
  });
});
