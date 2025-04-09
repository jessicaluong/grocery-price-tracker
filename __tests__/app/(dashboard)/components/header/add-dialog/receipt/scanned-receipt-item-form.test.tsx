import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReceiptItem } from "@/types/receipt";
import { UnitEnum } from "@/types/grocery";
import { ScannedReceiptItemForm } from "@/app/(dashboard)/groceries/components/header/add-dialog/receipt/scanned-receipt/scanned-receipt-item-form";

describe("ScannedReceiptItemForm", () => {
  const user = userEvent.setup();
  const mockOnCloseEdit = jest.fn();
  const mockOnSuccess = jest.fn();

  const mockItem = {
    name: "Milk",
    brand: "Dairyland",
    count: 1,
    amount: 2,
    unit: UnitEnum.L,
    price: 3.99,
    isSale: false,
  };

  const emptyItem = {
    name: "",
    brand: "",
    count: undefined,
    amount: undefined,
    unit: undefined,
    price: undefined,
    isSale: false,
  };

  it("renders with pre-filled data from item", () => {
    render(
      <ScannedReceiptItemForm
        index={0}
        item={mockItem}
        onCloseEdit={mockOnCloseEdit}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByLabelText("Name")).toHaveValue("Milk");
    expect(screen.getByLabelText("Brand")).toHaveValue("Dairyland");
    expect(screen.getByLabelText("Count")).toHaveValue("1");
    expect(screen.getByLabelText("Amount")).toHaveValue("2");
    expect(screen.getByLabelText("Price")).toHaveValue("3.99");
    expect(screen.getByRole("combobox", { name: "Unit" })).toHaveTextContent(
      UnitEnum.L
    );
    const saleLabel = screen.getByText("Sale?");
    const container = saleLabel.closest("div");
    const checkbox = container?.querySelector('[role="checkbox"]');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it("renders with empty data when item is empty", () => {
    render(
      <ScannedReceiptItemForm
        index={0}
        item={emptyItem as any} // Type assertion for testing
        onCloseEdit={mockOnCloseEdit}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Brand")).toHaveValue("");
  });

  it("allows editing item fields", async () => {
    render(
      <ScannedReceiptItemForm
        index={0}
        item={mockItem}
        onCloseEdit={mockOnCloseEdit}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText("Name");
    await user.clear(nameInput);
    await user.type(nameInput, "Whole Milk");
    expect(nameInput).toHaveValue("Whole Milk");

    const brandInput = screen.getByLabelText("Brand");
    await user.clear(brandInput);
    await user.type(brandInput, "Organic Valley");
    expect(brandInput).toHaveValue("Organic Valley");

    const countInput = screen.getByLabelText("Count");
    await user.clear(countInput);
    await user.type(countInput, "2");
    expect(countInput).toHaveValue("2");

    const amountInput = screen.getByLabelText("Amount");
    await user.clear(amountInput);
    await user.type(amountInput, "1");
    expect(amountInput).toHaveValue("1");

    const priceInput = screen.getByLabelText("Price");
    await user.clear(priceInput);
    await user.type(priceInput, "4.99");
    expect(priceInput).toHaveValue("4.99");

    const saleLabel = screen.getByText("Sale?");
    const container = saleLabel.closest("div");
    const checkbox = container?.querySelector('[role="checkbox"]');
    expect(checkbox).toBeInTheDocument();
    if (checkbox) {
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    }
  });

  it("calls onSuccess with updated values on form submission", async () => {
    render(
      <ScannedReceiptItemForm
        index={2} // Test with non-zero index
        item={mockItem}
        onCloseEdit={mockOnCloseEdit}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText("Name");
    await user.clear(nameInput);
    await user.type(nameInput, "Whole Milk");

    const priceInput = screen.getByLabelText("Price");
    await user.clear(priceInput);
    await user.type(priceInput, "4.99");

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    expect(mockOnSuccess.mock.calls[0][0]).toBe(2);
    expect(mockOnSuccess.mock.calls[0][1]).toMatchObject({
      name: "Whole Milk",
      price: 4.99,
    });

    // other fields unchanged
    expect(mockOnSuccess.mock.calls[0][1].brand).toBe("Dairyland");
    expect(mockOnSuccess.mock.calls[0][1].count).toBe(1);
    expect(mockOnSuccess.mock.calls[0][1].amount).toBe(2);
    expect(mockOnSuccess.mock.calls[0][1].unit).toBe(UnitEnum.L);
  });

  it("calls onCloseEdit when Cancel button is clicked", async () => {
    render(
      <ScannedReceiptItemForm
        index={0}
        item={mockItem}
        onCloseEdit={mockOnCloseEdit}
        onSuccess={mockOnSuccess}
      />
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockOnCloseEdit).toHaveBeenCalledTimes(1);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("validates the name field as required", async () => {
    render(
      <ScannedReceiptItemForm
        index={0}
        item={mockItem}
        onCloseEdit={mockOnCloseEdit}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText("Name");
    await user.clear(nameInput);

    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByText("Item name is required")).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("validates the price field as required", async () => {
    render(
      <ScannedReceiptItemForm
        index={0}
        item={{ ...mockItem, price: undefined } as any}
        onCloseEdit={mockOnCloseEdit}
        onSuccess={mockOnSuccess}
      />
    );

    const priceInput = screen.getByLabelText("Price");
    await user.clear(priceInput);

    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByText("Price must be a number")).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("validates numeric fields to be positive numbers", async () => {
    render(
      <ScannedReceiptItemForm
        index={0}
        item={mockItem}
        onCloseEdit={mockOnCloseEdit}
        onSuccess={mockOnSuccess}
      />
    );

    const countInput = screen.getByLabelText("Count");
    await user.clear(countInput);
    await user.type(countInput, "-1");

    const amountInput = screen.getByLabelText("Amount");
    await user.clear(amountInput);
    await user.type(amountInput, "-2");

    const priceInput = screen.getByLabelText("Price");
    await user.clear(priceInput);
    await user.type(priceInput, "-3.99");

    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByText("Count must be at least 1")).toBeInTheDocument();
      expect(screen.getByText("Amount must be at least 1")).toBeInTheDocument();
      expect(screen.getByText("Price cannot be negative")).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
