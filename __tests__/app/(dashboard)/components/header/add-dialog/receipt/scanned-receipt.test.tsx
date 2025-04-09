import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReceiptData } from "@/types/receipt";
import { useToast } from "@/hooks/use-toast";
import { addReceiptDataAction } from "@/actions/grocery-actions";
import { UnitEnum } from "@/types/grocery";
import ScannedReceipt from "@/app/(dashboard)/groceries/components/header/add-dialog/receipt/scanned-receipt/scanned-receipt";

jest.mock("@/actions/grocery-actions", () => ({
  addReceiptDataAction: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}));

describe("ScannedReceipt", () => {
  const user = userEvent.setup();
  const mockToast = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockReceiptData = {
    store: "Superstore",
    date: new Date("2025-03-01"),
    items: [
      {
        name: "Oats",
        brand: "Quaker",
        count: 1,
        amount: 1,
        unit: UnitEnum.kg,
        price: 5.99,
        isSale: false,
      },
      {
        name: "Yogurt",
        brand: "Danone",
        count: 1,
        amount: 2,
        unit: UnitEnum.kg,
        price: 8.99,
        isSale: false,
      },
      {
        name: "Milk",
        brand: "Dairyland",
        count: 2,
        amount: 2,
        unit: UnitEnum.L,
        price: 11,
        isSale: true,
      },
    ],
  };

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  it("renders correctly with receipt data", () => {
    render(<ScannedReceipt data={mockReceiptData} onSuccess={mockOnSuccess} />);

    expect(screen.getByText("Superstore")).toBeInTheDocument();

    expect(screen.getByText("Oats")).toBeInTheDocument();
    expect(screen.getByText("Yogurt")).toBeInTheDocument();
    expect(screen.getByText("Milk")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Add 3 items" })
    ).toBeInTheDocument();
  });

  it("shows empty state when there are no items", () => {
    const emptyReceiptData = {
      ...mockReceiptData,
      items: [],
    };

    render(
      <ScannedReceipt data={emptyReceiptData} onSuccess={mockOnSuccess} />
    );

    expect(
      screen.getByText("No items found on this receipt.")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Try scanning a different receipt or add items manually."
      )
    ).toBeInTheDocument();
  });

  it("shows error toast when form validation fails", async () => {
    const invalidReceiptData = {
      ...mockReceiptData,
      store: "",
      items: [{ name: "", price: 3.99 }],
    };

    render(
      <ScannedReceipt
        data={invalidReceiptData as any}
        onSuccess={mockOnSuccess}
      />
    );

    await user.click(screen.getByRole("button", { name: "Add 1 item" }));

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "destructive",
        description: expect.stringContaining("Please fill in required fields"),
      })
    );
  });

  it("calls onSuccess and shows toast when form submission succeeds", async () => {
    (addReceiptDataAction as jest.Mock).mockResolvedValue({ success: true });

    render(<ScannedReceipt data={mockReceiptData} onSuccess={mockOnSuccess} />);

    await user.click(screen.getByRole("button", { name: "Add 3 items" }));

    await waitFor(() => {
      expect(addReceiptDataAction).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Receipt saved.",
        })
      );
    });
  });

  it("shows error toast when server action fails", async () => {
    (addReceiptDataAction as jest.Mock).mockResolvedValue({
      error: "Server error occurred",
    });

    render(<ScannedReceipt data={mockReceiptData} onSuccess={mockOnSuccess} />);

    await user.click(screen.getByRole("button", { name: "Add 3 items" }));

    await waitFor(() => {
      expect(addReceiptDataAction).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          description: "Server error occurred",
        })
      );
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it("shows loading state during submission", async () => {
    let resolveAction: (value: any) => void;
    const actionPromise = new Promise((resolve) => {
      resolveAction = resolve;
    });

    (addReceiptDataAction as jest.Mock).mockReturnValue(actionPromise);

    render(<ScannedReceipt data={mockReceiptData} onSuccess={mockOnSuccess} />);

    await user.click(screen.getByRole("button", { name: "Add 3 items" }));

    expect(screen.getByText("Processing ...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Processing ..." })
    ).toBeDisabled();

    resolveAction!({ success: true });

    await waitFor(() => {
      expect(screen.queryByText("Processing ...")).not.toBeInTheDocument();
    });
  });

  it("handles field-specific errors from server response", async () => {
    (addReceiptDataAction as jest.Mock).mockResolvedValue({
      error: {
        store: ["Store name is required"],
        items: ["At least one item is required"],
      },
    });

    render(<ScannedReceipt data={mockReceiptData} onSuccess={mockOnSuccess} />);

    await user.click(screen.getByRole("button", { name: "Add 3 items" }));

    await waitFor(() => {
      expect(addReceiptDataAction).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          description: expect.stringContaining(
            "Please fill in required fields:"
          ),
        })
      );
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
});
