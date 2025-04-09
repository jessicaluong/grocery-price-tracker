import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScannedReceiptHeaderForm } from "@/app/(dashboard)/groceries/components/header/add-dialog/receipt/scanned-receipt/scanned-receipt-header-form";

describe("ScannedReceiptHeaderForm", () => {
  const user = userEvent.setup();
  const mockOnCloseEdit = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockReceiptData = {
    store: "Superstore",
    date: new Date("2025-03-15"),
    items: [],
  };

  it("renders with pre-filled data from receipt", () => {
    render(
      <ScannedReceiptHeaderForm
        receiptData={mockReceiptData}
        onCloseEdit={mockOnCloseEdit}
        onSuccess={mockOnSuccess}
      />
    );

    const storeInput = screen.getByLabelText("Store");
    expect(storeInput).toHaveValue("Superstore");
    expect(screen.getByText(/March 15th, 2025/i)).toBeInTheDocument();
  });

  it("allows editing store name", async () => {
    render(
      <ScannedReceiptHeaderForm
        receiptData={mockReceiptData}
        onCloseEdit={mockOnCloseEdit}
        onSuccess={mockOnSuccess}
      />
    );

    const storeInput = screen.getByLabelText("Store");
    await user.clear(screen.getByLabelText("Store"));
    await user.type(storeInput, "New Store Name");

    expect(storeInput).toHaveValue("New Store Name");
  });

  it("allows selecting a date", async () => {
    render(
      <ScannedReceiptHeaderForm
        receiptData={mockReceiptData}
        onCloseEdit={mockOnCloseEdit}
        onSuccess={mockOnSuccess}
      />
    );

    await user.click(screen.getByText("March 15th, 2025"));
    await user.click(screen.getAllByRole("gridcell", { name: "1" })[0]);
    await user.keyboard("{Escape}");

    expect(screen.getByText(/March 1st, 2025/i)).toBeInTheDocument();
  });

  it("calls onSuccess with updated values on form submission", async () => {
    render(
      <ScannedReceiptHeaderForm
        receiptData={mockReceiptData}
        onCloseEdit={mockOnCloseEdit}
        onSuccess={mockOnSuccess}
      />
    );

    const storeInput = screen.getByLabelText("Store");
    await user.clear(screen.getByLabelText("Store"));
    await user.type(storeInput, "New Store Name");

    await user.click(screen.getByText("March 15th, 2025"));
    await user.click(screen.getAllByRole("gridcell", { name: "1" })[0]);
    await user.keyboard("{Escape}");

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(mockOnSuccess).toHaveBeenCalled();

    expect(mockOnSuccess.mock.calls[0][0]).toBe("New Store Name");

    expect(mockOnSuccess.mock.calls[0][1]).toBeInstanceOf(Date);
  });

  it("calls onCloseEdit when Cancel button is clicked", async () => {
    render(
      <ScannedReceiptHeaderForm
        receiptData={mockReceiptData}
        onCloseEdit={mockOnCloseEdit}
        onSuccess={mockOnSuccess}
      />
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockOnCloseEdit).toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("validates the store field as required", async () => {
    render(
      <ScannedReceiptHeaderForm
        receiptData={mockReceiptData}
        onCloseEdit={mockOnCloseEdit}
        onSuccess={mockOnSuccess}
      />
    );

    const storeInput = screen.getByLabelText("Store");
    await user.clear(storeInput);
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByText("Store name is required")).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
