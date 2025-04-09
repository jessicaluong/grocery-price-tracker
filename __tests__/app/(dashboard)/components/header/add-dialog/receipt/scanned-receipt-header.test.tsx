import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReceiptData } from "@/types/receipt";
import { formatDate } from "@/lib/utils";
import ScannedReceiptHeader from "@/app/(dashboard)/groceries/components/header/add-dialog/receipt/scanned-receipt/scanned-receipt-header";
import { UnitEnum } from "@/types/grocery";

jest.mock("@/lib/utils", () => ({
  ...jest.requireActual("@/lib/utils"),
  cn: (...inputs: any[]) => inputs.join(" "),
  formatDate: jest.fn(),
}));

jest.mock("date-fns", () => ({
  ...jest.requireActual("date-fns"),
  format: jest.fn(() => "March 27, 2025"),
}));

beforeEach(() => {
  (formatDate as jest.Mock).mockReturnValue("March 27th, 2025");
});

describe("ScannedReceiptHeader", () => {
  const user = userEvent.setup();
  const mockHandleSubmitHeader = jest.fn();
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
      brand: "Dairyland",
      count: 2,
      amount: 2,
      unit: UnitEnum.L,
      price: 11,
      isSale: true,
    },
  ];

  const mockReceiptData = {
    store: "Superstore",
    date: new Date("2025-03-27T11:00:00.000Z"),
    items: mockItems,
  };

  it("renders header in normal mode with receipt data", () => {
    render(
      <ScannedReceiptHeader
        receiptData={mockReceiptData}
        handleSubmitHeader={mockHandleSubmitHeader}
        onEditClick={mockOnEditClick}
        onCancelEdit={mockOnCancelEdit}
        editMode={null}
        disabled={false}
        hasErrors={false}
      />
    );

    expect(screen.getByText("Superstore")).toBeInTheDocument();
    expect(screen.getByText("March 27th, 2025")).toBeInTheDocument();

    const editButton = screen.getByRole("button");
    expect(editButton).toBeInTheDocument();
    expect(editButton).not.toBeDisabled();
  });

  it("renders edit form when in header edit mode", () => {
    render(
      <ScannedReceiptHeader
        receiptData={mockReceiptData}
        handleSubmitHeader={mockHandleSubmitHeader}
        onEditClick={mockOnEditClick}
        onCancelEdit={mockOnCancelEdit}
        editMode="header"
        disabled={false}
        hasErrors={false}
      />
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("renders header with error styling when hasErrors is true", () => {
    render(
      <ScannedReceiptHeader
        receiptData={mockReceiptData}
        handleSubmitHeader={mockHandleSubmitHeader}
        onEditClick={mockOnEditClick}
        onCancelEdit={mockOnCancelEdit}
        editMode={null}
        disabled={false}
        hasErrors={true}
      />
    );

    const outerContainer = screen.getByTestId("header-container");
    expect(outerContainer).toHaveClass("border-red-500");
    expect(outerContainer).toHaveClass("bg-red-100");
  });

  it("calls onEditClick when edit button is clicked", async () => {
    render(
      <ScannedReceiptHeader
        receiptData={mockReceiptData}
        handleSubmitHeader={mockHandleSubmitHeader}
        onEditClick={mockOnEditClick}
        onCancelEdit={mockOnCancelEdit}
        editMode={null}
        disabled={false}
        hasErrors={false}
      />
    );

    const editButton = screen.getByRole("button");
    await user.click(editButton);

    expect(mockOnEditClick).toHaveBeenCalledTimes(1);
  });

  it("disables edit button when disabled prop is true", () => {
    render(
      <ScannedReceiptHeader
        receiptData={mockReceiptData}
        handleSubmitHeader={mockHandleSubmitHeader}
        onEditClick={mockOnEditClick}
        onCancelEdit={mockOnCancelEdit}
        editMode={null}
        disabled={true}
        hasErrors={false}
      />
    );

    const editButton = screen.getByRole("button");
    expect(editButton).toBeDisabled();
  });

  it("displays required for empty values", () => {
    const emptyReceiptData = {};

    render(
      <ScannedReceiptHeader
        receiptData={emptyReceiptData as any}
        handleSubmitHeader={mockHandleSubmitHeader}
        onEditClick={mockOnEditClick}
        onCancelEdit={mockOnCancelEdit}
        editMode={null}
        disabled={false}
        hasErrors={false}
      />
    );

    const storeLabel = screen.getByText("Store");
    const dateLabel = screen.getByText("Date");

    expect(storeLabel.closest("div")).toHaveTextContent(/required/i);
    expect(dateLabel.closest("div")).toHaveTextContent(/required/i);
  });
});
