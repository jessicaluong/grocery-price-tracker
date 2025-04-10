import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { scanReceiptAction } from "@/actions/receipt-actions";
import { useToast } from "@/hooks/use-toast";
import UploadForm from "@/app/(dashboard)/groceries/components/header/add-dialog/receipt/upload-form";

jest.mock("@/actions/receipt-actions", () => ({
  scanReceiptAction: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}));

describe("UploadForm", () => {
  const mockOnScanResult = jest.fn();
  const mockToast = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

    global.URL.createObjectURL = jest.fn(() => "mock-url");
    global.URL.revokeObjectURL = jest.fn();
  });

  it("renders the upload interface correctly", () => {
    render(<UploadForm onScanResult={mockOnScanResult} />);

    expect(screen.getByText("Browse Files")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Scan Receipt" })).toBeDisabled();
  });

  it("allows file selection and enables the scan button", async () => {
    render(<UploadForm onScanResult={mockOnScanResult} />);

    const file = new File(["dummy content"], "receipt.jpg", {
      type: "image/jpeg",
    });
    const input = screen.getByTestId("file-input");

    await user.upload(input, file);

    expect(screen.getByText("receipt.jpg")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Scan Receipt" })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Change File" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Receipt preview" })
    ).toHaveAttribute("src", "mock-url");
  });

  it("allows changing the selected file", async () => {
    render(<UploadForm onScanResult={mockOnScanResult} />);

    // Upload first file
    const file1 = new File(["dummy content"], "receipt1.jpg", {
      type: "image/jpeg",
    });
    const input = screen.getByTestId("file-input");

    await user.upload(input, file1);

    expect(screen.getByText("receipt1.jpg")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Change File" }));

    expect(screen.queryByText("receipt1.jpg")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Scan Receipt" })).toBeDisabled();
  });

  it("calls scanReceiptAction when scan button is clicked", async () => {
    (scanReceiptAction as jest.Mock).mockResolvedValue({
      success: true,
      data: { store: "Test Store", date: "2023-01-01", items: [] },
    });

    render(<UploadForm onScanResult={mockOnScanResult} />);

    const file = new File(["dummy content"], "receipt.jpg", {
      type: "image/jpeg",
    });
    const input = screen.getByTestId("file-input");

    await user.upload(input, file);
    await user.click(screen.getByRole("button", { name: "Scan Receipt" }));

    expect(scanReceiptAction).toHaveBeenCalled();

    // Check that FormData was created with the file
    const formDataArg = (scanReceiptAction as jest.Mock).mock.calls[0][0];
    expect(formDataArg instanceof FormData).toBe(true);

    await waitFor(() => {
      expect(mockOnScanResult).toHaveBeenCalledWith(
        expect.objectContaining({
          store: "Test Store",
          date: "2023-01-01",
          items: [],
        })
      );
    });
  });

  it("displays loading state while processing", async () => {
    let resolveAction: (value: any) => void;
    const actionPromise = new Promise((resolve) => {
      resolveAction = resolve;
    });

    (scanReceiptAction as jest.Mock).mockReturnValue(actionPromise);

    render(<UploadForm onScanResult={mockOnScanResult} />);

    const file = new File(["dummy content"], "receipt.jpg", {
      type: "image/jpeg",
    });
    const input = screen.getByTestId("file-input");

    await user.upload(input, file);
    await user.click(screen.getByRole("button", { name: "Scan Receipt" }));

    expect(
      screen.getByRole("button", { name: "Processing..." })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Processing..." })
    ).toBeDisabled();

    resolveAction!({
      success: true,
      data: { store: "Test Store", date: "2023-01-01", items: [] },
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: "Processing..." })
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Scan Receipt" })
      ).toBeInTheDocument();
    });
  });

  it("shows error toast when scan fails", async () => {
    (scanReceiptAction as jest.Mock).mockResolvedValue({
      error: "Failed to scan receipt",
    });

    render(<UploadForm onScanResult={mockOnScanResult} />);

    const file = new File(["dummy content"], "receipt.jpg", {
      type: "image/jpeg",
    });
    const input = screen.getByTestId("file-input");

    await user.upload(input, file);

    await user.click(screen.getByRole("button", { name: "Scan Receipt" }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        description: "Failed to scan receipt",
      });
    });

    // Called exactly once with null (from handleFileChange)
    // and never with any other arguments
    expect(mockOnScanResult).toHaveBeenCalledTimes(1);
    expect(mockOnScanResult).toHaveBeenCalledWith(null);
  });

  it("handles scan with no extracted items", async () => {
    (scanReceiptAction as jest.Mock).mockResolvedValue({
      success: true,
      data: null,
    });

    render(<UploadForm onScanResult={mockOnScanResult} />);

    const file = new File(["dummy content"], "receipt.jpg", {
      type: "image/jpeg",
    });
    const input = screen.getByTestId("file-input");

    await user.upload(input, file);
    await user.click(screen.getByRole("button", { name: "Scan Receipt" }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        description: "Unable to extract items from receipt",
      });
    });
  });

  it("handles unexpected errors during scan", async () => {
    (scanReceiptAction as jest.Mock).mockRejectedValue(
      new Error("Unexpected error")
    );

    render(<UploadForm onScanResult={mockOnScanResult} />);

    const file = new File(["dummy content"], "receipt.jpg", {
      type: "image/jpeg",
    });
    const input = screen.getByTestId("file-input");

    await user.upload(input, file);
    await user.click(screen.getByRole("button", { name: "Scan Receipt" }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        description: "Unable to process receipt",
      });
    });

    // Called exactly once with null (from handleFileChange)
    // and never with any other arguments
    expect(mockOnScanResult).toHaveBeenCalledTimes(1);
    expect(mockOnScanResult).toHaveBeenCalledWith(null);
  });

  it("resets scan results when a new file is selected", async () => {
    render(<UploadForm onScanResult={mockOnScanResult} />);

    const file = new File(["dummy content"], "receipt.jpg", {
      type: "image/jpeg",
    });
    const input = screen.getByTestId("file-input");

    await user.upload(input, file);

    // Called exactly once with null (from handleFileChange)
    // and never with any other arguments
    expect(mockOnScanResult).toHaveBeenCalledTimes(1);
    expect(mockOnScanResult).toHaveBeenCalledWith(null);
  });
});
