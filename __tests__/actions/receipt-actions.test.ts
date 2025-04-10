import DocumentIntelligence, {
  AnalyzedDocumentOutput,
  getLongRunningPoller,
  isUnexpected,
} from "@azure-rest/ai-document-intelligence";
import { scanReceiptAction } from "@/actions/receipt-actions";
import { verifySession } from "@/lib/auth";
import { AzureKeyCredential } from "@azure/core-auth";

jest.mock("@/lib/auth", () => ({
  verifySession: jest.fn(),
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
