import DocumentIntelligence, {
  AnalyzedDocumentOutput,
  getLongRunningPoller,
  isUnexpected,
} from "@azure-rest/ai-document-intelligence";
import { scanReceiptAction } from "@/actions/receipt-actions";
import { verifySession } from "@/lib/auth";
import { AzureKeyCredential } from "@azure/core-auth";
import { checkAndUpdateScanUsage } from "@/lib/scan-rate-limit";

jest.mock("@/lib/auth", () => ({
  verifySession: jest.fn(),
}));

jest.mock("@/lib/scan-rate-limit", () => ({
  checkAndUpdateScanUsage: jest.fn(),
}));

jest.mock("@azure-rest/ai-document-intelligence", () => {
  const mockClient = {
    path: jest.fn().mockReturnThis(),
    post: jest.fn(),
  };

  return {
    __esModule: true,
    default: jest.fn(() => mockClient),
    getLongRunningPoller: jest.fn(),
    isUnexpected: jest.fn(),
  };
});

jest.mock("@azure/core-auth", () => ({
  AzureKeyCredential: jest.fn(),
}));

describe("Receipt server actions", () => {
  beforeEach(() => {
    (verifySession as jest.Mock).mockResolvedValue({
      userId: "test-user-id",
    });

    (checkAndUpdateScanUsage as jest.Mock).mockResolvedValue({
      success: true,
    });
  });

  describe("authentication", () => {
    it("should return an error if user is not authenticated", async () => {
      (verifySession as jest.Mock).mockResolvedValue(null);

      const formData = new FormData();
      formData.append(
        "file",
        new File(["test"], "test.jpg", { type: "image/jpeg" })
      );

      const result = await scanReceiptAction(formData);

      expect(result).toEqual({
        error: "You must be logged in to scan receipts",
      });
      expect(verifySession).toHaveBeenCalledWith({ redirect: false });
      expect(result).toEqual({
        error: "You must be logged in to scan receipts",
      });
      expect(DocumentIntelligence).not.toHaveBeenCalled();
    });
  });

  describe("rate limiting", () => {
    it("should check scan usage before processing", async () => {
      const formData = new FormData();
      formData.append(
        "file",
        new File(["test"], "test.jpg", { type: "image/jpeg" })
      );

      await scanReceiptAction(formData);

      expect(checkAndUpdateScanUsage).toHaveBeenCalledWith("test-user-id");
    });

    it("should return an error if daily scan limit is reached", async () => {
      (checkAndUpdateScanUsage as jest.Mock).mockResolvedValue({
        success: false,
        message: "Daily scan limit reached",
      });

      const formData = new FormData();
      formData.append(
        "file",
        new File(["test"], "test.jpg", { type: "image/jpeg" })
      );

      const result = await scanReceiptAction(formData);

      expect(result).toEqual({
        error: "Daily scan limit reached",
      });
      expect(DocumentIntelligence).not.toHaveBeenCalled();
    });

    it("should return an error if monthly scan limit is reached", async () => {
      (checkAndUpdateScanUsage as jest.Mock).mockResolvedValue({
        success: false,
        message: "Monthly scan limit reached",
      });

      const formData = new FormData();
      formData.append(
        "file",
        new File(["test"], "test.jpg", { type: "image/jpeg" })
      );

      const result = await scanReceiptAction(formData);

      expect(result).toEqual({
        error: "Monthly scan limit reached",
      });
      expect(DocumentIntelligence).not.toHaveBeenCalled();
    });
  });

  describe("file validation", () => {
    it("should return an error if uploaded file is not an image", async () => {
      const formData = new FormData();
      formData.append(
        "file",
        new File(["test"], "test.pdf", { type: "application/pdf" })
      );

      const result = await scanReceiptAction(formData);

      expect(result).toEqual({ error: "Uploaded file must be an image" });
      expect(DocumentIntelligence).not.toHaveBeenCalled();
    });
  });

  describe("Azure credentials", () => {
    it("should return an error if Azure credentials are missing", async () => {
      process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT = "";
      process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY = "";

      const formData = new FormData();
      formData.append(
        "file",
        new File(["test"], "test.jpg", { type: "image/jpeg" })
      );

      const result = await scanReceiptAction(formData);

      expect(result).toEqual({ error: "Azure credentials not found" });
      expect(DocumentIntelligence).not.toHaveBeenCalled();
    });
  });
});
