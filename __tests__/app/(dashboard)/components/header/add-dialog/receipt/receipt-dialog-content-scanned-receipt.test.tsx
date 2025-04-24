import { render, screen } from "@testing-library/react";
import ReceiptDialogContentScannedReceipt from "@/app/(dashboard)/groceries/components/header/add-dialog/receipt/receipt-dialog-content-scanned-receipt";
import { ReceiptData } from "@/types/receipt";
import { Dialog } from "@/components/ui/dialog";

jest.mock(
  "@/app/(dashboard)/groceries/components/header/add-dialog/receipt/scanned-receipt/scanned-receipt",
  () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="scanned-receipt" />),
  })
);

describe("ReceiptDialogContentScannedReceipt", () => {
  const mockOnClose = jest.fn();

  it("renders scanned receipt component when there are items", () => {
    const mockScanResult: ReceiptData = {
      store: "Test Store",
      date: new Date(),
      items: [
        {
          name: "Test Item",
          price: 9.99,
          count: 1,
          amount: 1,
          unit: "units",
          brand: null,
          isSale: false,
        },
      ],
    };

    render(
      <Dialog>
        <ReceiptDialogContentScannedReceipt
          scanResult={mockScanResult}
          onClose={mockOnClose}
        />
      </Dialog>
    );

    expect(screen.getByText("Receipt Details")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Edit your scanned receipt before adding the items to your grocery tracker."
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId("scanned-receipt")).toBeInTheDocument();
  });

  it("displays empty state message when no items found", () => {
    const mockEmptyScanResult: ReceiptData = {
      store: "Test Store",
      date: new Date(),
      items: [],
    };

    render(
      <Dialog>
        <ReceiptDialogContentScannedReceipt
          scanResult={mockEmptyScanResult}
          onClose={mockOnClose}
        />
      </Dialog>
    );

    expect(screen.getByText("Receipt Details")).toBeInTheDocument();
    expect(
      screen.getByText("No items found on this receipt.")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Try scanning a different receipt or add items manually."
      )
    ).toBeInTheDocument();
    expect(screen.queryByTestId("scanned-receipt")).not.toBeInTheDocument();
  });

  it("displays empty description when no items found", () => {
    const mockEmptyScanResult: ReceiptData = {
      store: "Test Store",
      date: new Date(),
      items: [],
    };

    render(
      <Dialog>
        <ReceiptDialogContentScannedReceipt
          scanResult={mockEmptyScanResult}
          onClose={mockOnClose}
        />
      </Dialog>
    );

    expect(
      screen.queryByText(
        "Edit your scanned receipt before adding the items to your grocery tracker."
      )
    ).not.toBeInTheDocument();
  });
});
