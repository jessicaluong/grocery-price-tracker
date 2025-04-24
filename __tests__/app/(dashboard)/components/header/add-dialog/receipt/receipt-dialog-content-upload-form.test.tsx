import { render, screen } from "@testing-library/react";
import ReceiptDialogContentUploadForm from "@/app/(dashboard)/groceries/components/header/add-dialog/receipt/receipt-dialog-content-upload-form";
import UploadForm from "@/app/(dashboard)/groceries/components/header/add-dialog/receipt/upload-form";
import { Dialog } from "@/components/ui/dialog";

jest.mock(
  "@/app/(dashboard)/groceries/components/header/add-dialog/receipt/upload-form",
  () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="upload-form" />),
  })
);

jest.mock(
  "@/app/(dashboard)/groceries/components/header/add-dialog/receipt/receipt-quota-display",
  () => ({
    __esModule: true,
    default: jest.fn(({ dailyRemaining, monthlyRemaining }) => (
      <div data-testid="receipt-quota-display">
        Daily: {dailyRemaining}, Monthly: {monthlyRemaining}
      </div>
    )),
  })
);

describe("ReceiptDialogContentUploadForm", () => {
  const mockHandleSetScanResult = jest.fn();

  it("renders the upload form with dialog header", () => {
    render(
      <Dialog>
        <ReceiptDialogContentUploadForm
          handleSetScanResult={mockHandleSetScanResult}
          isQuotaLoading={false}
          quotaError={null}
          quotaData={{ dailyRemaining: 5, monthlyRemaining: 20 }}
        />
      </Dialog>
    );

    expect(screen.getByText("Upload Receipt")).toBeInTheDocument();
    expect(screen.getByTestId("receipt-quota-display")).toBeInTheDocument();
    expect(screen.getByTestId("upload-form")).toBeInTheDocument();
  });

  it("shows loading state when quota is loading", () => {
    render(
      <Dialog>
        <ReceiptDialogContentUploadForm
          handleSetScanResult={mockHandleSetScanResult}
          isQuotaLoading={true}
          quotaError={null}
          quotaData={null}
        />
      </Dialog>
    );

    expect(screen.getByText("Loading usage stats...")).toBeInTheDocument();
    expect(screen.getByTestId("upload-form")).toBeInTheDocument();
  });

  it("shows error message when quota loading fails", () => {
    render(
      <Dialog>
        <ReceiptDialogContentUploadForm
          handleSetScanResult={mockHandleSetScanResult}
          isQuotaLoading={false}
          quotaError={new Error("Failed to load")}
          quotaData={null}
        />
      </Dialog>
    );

    expect(
      screen.getByText("Unable to load usage stats. Please try again later.")
    ).toBeInTheDocument();
    expect(screen.getByTestId("upload-form")).toBeInTheDocument();
  });

  it("passes correct props to UploadForm when quota data is available", () => {
    render(
      <Dialog>
        <ReceiptDialogContentUploadForm
          handleSetScanResult={mockHandleSetScanResult}
          isQuotaLoading={false}
          quotaError={null}
          quotaData={{ dailyRemaining: 5, monthlyRemaining: 20 }}
        />
      </Dialog>
    );

    expect(UploadForm).toHaveBeenCalledWith(
      {
        onScanResult: mockHandleSetScanResult,
        hasScansRemaining: true,
      },
      expect.anything()
    );
  });

  it("passes hasScansRemaining=false to UploadForm when daily quota is exhausted", () => {
    render(
      <Dialog>
        <ReceiptDialogContentUploadForm
          handleSetScanResult={mockHandleSetScanResult}
          isQuotaLoading={false}
          quotaError={null}
          quotaData={{ dailyRemaining: 0, monthlyRemaining: 20 }}
        />
      </Dialog>
    );

    expect(UploadForm).toHaveBeenCalledWith(
      {
        onScanResult: mockHandleSetScanResult,
        hasScansRemaining: false,
      },
      expect.anything()
    );
  });

  it("passes hasScansRemaining=false to UploadForm when monthly quota is exhausted", () => {
    render(
      <Dialog>
        <ReceiptDialogContentUploadForm
          handleSetScanResult={mockHandleSetScanResult}
          isQuotaLoading={false}
          quotaError={null}
          quotaData={{ dailyRemaining: 5, monthlyRemaining: 0 }}
        />
      </Dialog>
    );

    expect(UploadForm).toHaveBeenCalledWith(
      {
        onScanResult: mockHandleSetScanResult,
        hasScansRemaining: false,
      },
      expect.anything()
    );
  });

  it("passes hasScansRemaining=false to UploadForm when quota data is null", () => {
    render(
      <Dialog>
        <ReceiptDialogContentUploadForm
          handleSetScanResult={mockHandleSetScanResult}
          isQuotaLoading={false}
          quotaError={null}
          quotaData={null}
        />
      </Dialog>
    );

    expect(UploadForm).toHaveBeenCalledWith(
      {
        onScanResult: mockHandleSetScanResult,
        hasScansRemaining: false,
      },
      expect.anything()
    );
  });
});
