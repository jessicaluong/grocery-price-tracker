import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReceiptData, ReceiptItem } from "@/types/receipt";
import { UnitEnum } from "@/types/grocery";
import ScannedReceiptItems from "@/app/(dashboard)/groceries/components/header/add-dialog/receipt/scanned-receipt/scanned-receipt-items";

describe("ScannedReceiptItems", () => {
  const user = userEvent.setup();
  const mockHandleSubmitItem = jest.fn();
  const mockHandleDeleteItem = jest.fn();
  const mockOnEditClick = jest.fn();
  const mockOnCancelEdit = jest.fn();

  const mockItems = [
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
      brand: null,
      count: 2,
      amount: 2,
      unit: UnitEnum.L,
      price: 11,
      isSale: true,
    },
  ];

  const mockReceiptData = {
    store: "Superstore",
    date: new Date("2025-03-27"),
    items: mockItems,
  };

  it("renders items in normal mode with a list of receipt items", () => {
    render(
      <ScannedReceiptItems
        receiptData={mockReceiptData}
        handleSubmitItem={mockHandleSubmitItem}
        handleDeleteItem={mockHandleDeleteItem}
        onEditClick={mockOnEditClick}
        onCancelEdit={mockOnCancelEdit}
        editItemIndex={null}
        disabled={false}
        itemsWithErrors={new Set()}
      />
    );

    expect(screen.getByText("Oats")).toBeInTheDocument();
    expect(screen.getByText("Yogurt")).toBeInTheDocument();
    expect(screen.getByText("Milk")).toBeInTheDocument();

    // check each item has edit and delete buttons
    const actionButtons = screen.getAllByRole("button");
    expect(actionButtons.length).toBe(6);
  });

  it("renders edit form for the selected item", () => {
    render(
      <ScannedReceiptItems
        receiptData={mockReceiptData}
        handleSubmitItem={mockHandleSubmitItem}
        handleDeleteItem={mockHandleDeleteItem}
        onEditClick={mockOnEditClick}
        onCancelEdit={mockOnCancelEdit}
        editItemIndex={0}
        disabled={false}
        itemsWithErrors={new Set()}
      />
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("highlights items with errors", () => {
    // Set the first and third items to have errors
    const itemsWithErrors = new Set([0, 2]);

    render(
      <ScannedReceiptItems
        receiptData={mockReceiptData}
        handleSubmitItem={mockHandleSubmitItem}
        handleDeleteItem={mockHandleDeleteItem}
        onEditClick={mockOnEditClick}
        onCancelEdit={mockOnCancelEdit}
        editItemIndex={null}
        disabled={false}
        itemsWithErrors={itemsWithErrors}
      />
    );

    const errorElement = document.querySelector(".border-red-500.bg-red-100");
    expect(errorElement).not.toBeNull();

    const container0 = screen.getByTestId("item-0-container");
    expect(container0).toHaveClass("border-red-500");
    expect(container0).toHaveClass("bg-red-100");

    const container1 = screen.getByTestId("item-1-container");
    expect(container1).not.toHaveClass("border-red-500");
    expect(container1).not.toHaveClass("bg-red-100");

    const container2 = screen.getByTestId("item-2-container");
    expect(container2).toHaveClass("border-red-500");
    expect(container2).toHaveClass("bg-red-100");
  });

  it("calls onEditClick with correct index when edit button is clicked", async () => {
    render(
      <ScannedReceiptItems
        receiptData={mockReceiptData}
        handleSubmitItem={mockHandleSubmitItem}
        handleDeleteItem={mockHandleDeleteItem}
        onEditClick={mockOnEditClick}
        onCancelEdit={mockOnCancelEdit}
        editItemIndex={null}
        disabled={false}
        itemsWithErrors={new Set()}
      />
    );

    // Find all edit buttons (should be 3, one for each item)
    const editButtons = screen.getAllByRole("button").filter(
      (button, index) => index % 2 === 0 // Even indices are edit buttons in this component
    );

    // Click the edit button for the second item
    await user.click(editButtons[1]);

    // Check onEditClick was called with index 1
    expect(mockOnEditClick).toHaveBeenCalledWith(1);
  });

  it("calls handleDeleteItem with correct index when delete button is clicked", async () => {
    render(
      <ScannedReceiptItems
        receiptData={mockReceiptData}
        handleSubmitItem={mockHandleSubmitItem}
        handleDeleteItem={mockHandleDeleteItem}
        onEditClick={mockOnEditClick}
        onCancelEdit={mockOnCancelEdit}
        editItemIndex={null}
        disabled={false}
        itemsWithErrors={new Set()}
      />
    );

    // Find all delete buttons (should be 3, one for each item)
    const deleteButtons = screen.getAllByRole("button").filter(
      (button, index) => index % 2 === 1 // Odd indices are delete buttons in this component
    );

    // Click the delete button for the third item
    await user.click(deleteButtons[2]);

    // Check handleDeleteItem was called with index 2
    expect(mockHandleDeleteItem).toHaveBeenCalledWith(2);
  });

  it("disables buttons when disabled prop is true", () => {
    render(
      <ScannedReceiptItems
        receiptData={mockReceiptData}
        handleSubmitItem={mockHandleSubmitItem}
        handleDeleteItem={mockHandleDeleteItem}
        onEditClick={mockOnEditClick}
        onCancelEdit={mockOnCancelEdit}
        editItemIndex={null}
        disabled={true}
        itemsWithErrors={new Set()}
      />
    );

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("displays optional for empty optional fields", () => {
    const mockItems = [
      {
        name: "Milk",
        brand: null,
        count: 2,
        amount: 2,
        unit: UnitEnum.L,
        price: 11,
        isSale: true,
      },
    ];

    const mockReceiptData = {
      store: "Superstore",
      date: new Date("2025-03-27"),
      items: mockItems,
    };

    render(
      <ScannedReceiptItems
        receiptData={mockReceiptData}
        handleSubmitItem={mockHandleSubmitItem}
        handleDeleteItem={mockHandleDeleteItem}
        onEditClick={mockOnEditClick}
        onCancelEdit={mockOnCancelEdit}
        editItemIndex={null}
        disabled={false}
        itemsWithErrors={new Set()}
      />
    );

    expect(screen.getByText("Brand")).toBeInTheDocument();
    const brandLabel = screen.getByText("Brand");
    expect(brandLabel.closest("div")).toHaveTextContent(/optional/i);
  });

  it("displays required for empty required fields", () => {
    const mockItems = [
      {
        name: null,
        brand: "Dairyland",
        count: 2,
        amount: 2,
        unit: UnitEnum.L,
        price: null,
        isSale: true,
      },
    ];

    const mockReceiptData = {
      store: "Superstore",
      date: new Date("2025-03-27"),
      items: mockItems,
    };

    render(
      <ScannedReceiptItems
        receiptData={mockReceiptData as any}
        handleSubmitItem={mockHandleSubmitItem}
        handleDeleteItem={mockHandleDeleteItem}
        onEditClick={mockOnEditClick}
        onCancelEdit={mockOnCancelEdit}
        editItemIndex={null}
        disabled={false}
        itemsWithErrors={new Set()}
      />
    );

    const nameLabel = screen.getByText("Name");
    const priceLabel = screen.getByText("Price");

    expect(nameLabel.closest("div")).toHaveTextContent(/required/i);
    expect(priceLabel.closest("div")).toHaveTextContent(/required/i);
  });
});
