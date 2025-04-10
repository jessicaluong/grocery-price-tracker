import DocumentIntelligence, {
  AnalyzedDocumentOutput,
  getLongRunningPoller,
  isUnexpected,
} from "@azure-rest/ai-document-intelligence";
import {
  processSaleItemName,
  scanReceiptAction,
} from "@/actions/receipt-actions";
import { verifySession } from "@/lib/auth";
import { AzureKeyCredential } from "@azure/core-auth";
import { capitalizeWords } from "@/lib/utils";

jest.mock("@/lib/auth", () => ({
  verifySession: jest.fn(),
}));

jest.mock("@/lib/utils", () => ({
  capitalizeWords: jest.fn((text) => text),
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

    (capitalizeWords as jest.Mock).mockImplementation((text) => {
      if (!text) return "";
      return text
        .split(" ")
        .map(
          (word: string) =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
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

  describe("processSaleItemName", () => {
    it("should handle null input", () => {
      const result = processSaleItemName(null);
      expect(result).toEqual({ normalizedName: null, isSale: false });
      expect(capitalizeWords).not.toHaveBeenCalled();
    });

    it("should handle empty string input", () => {
      const result = processSaleItemName("");
      expect(result).toEqual({ normalizedName: null, isSale: false });
      expect(capitalizeWords).not.toHaveBeenCalled();
    });

    it("should detect (SALE) pattern", () => {
      const result = processSaleItemName("bread (SALE)");
      expect(result).toEqual({ normalizedName: "Bread", isSale: true });
      expect(capitalizeWords).toHaveBeenCalledWith("bread");
    });

    it("should detect (sale) pattern with different casing", () => {
      const result = processSaleItemName("milk (sale)");
      expect(result).toEqual({ normalizedName: "Milk", isSale: true });
      expect(capitalizeWords).toHaveBeenCalledWith("milk");
    });

    it("should detect [sale] pattern", () => {
      const result = processSaleItemName("eggs [sale]");
      expect(result).toEqual({ normalizedName: "Eggs", isSale: true });
      expect(capitalizeWords).toHaveBeenCalledWith("eggs");
    });

    it("should detect the word 'sale' at the end", () => {
      const result = processSaleItemName("cheese sale");
      expect(result).toEqual({ normalizedName: "Cheese", isSale: true });
      expect(capitalizeWords).toHaveBeenCalledWith("cheese");
    });

    it("should detect the word 'sale' at the beginning", () => {
      const result = processSaleItemName("sale cheese");
      expect(result).toEqual({ normalizedName: "Cheese", isSale: true });
      expect(capitalizeWords).toHaveBeenCalledWith("cheese");
    });

    it("should detect the word 'sale' in the middle", () => {
      const result = processSaleItemName("cheddar sale cheese");
      expect(result).toEqual({
        normalizedName: "Cheddar Cheese",
        isSale: true,
      });
      expect(capitalizeWords).toHaveBeenCalledWith("cheddar cheese");
    });

    it("should not detect 'sale' when it's part of another word", () => {
      const result = processSaleItemName("wholesale items");
      expect(result).toEqual({
        normalizedName: "Wholesale Items",
        isSale: false,
      });
      expect(capitalizeWords).toHaveBeenCalledWith("wholesale items");
    });

    it("should clean up multiple whitespace", () => {
      const result = processSaleItemName("organic   apples   (SALE)");
      expect(result).toEqual({
        normalizedName: "Organic Apples",
        isSale: true,
      });
      expect(capitalizeWords).toHaveBeenCalledWith("organic apples");
    });

    it("should normalize normal items without sale tag", () => {
      const result = processSaleItemName("organic apples");
      expect(result).toEqual({
        normalizedName: "Organic Apples",
        isSale: false,
      });
      expect(capitalizeWords).toHaveBeenCalledWith("organic apples");
    });

    it("should handle mixed case input", () => {
      const result = processSaleItemName("OrGaNiC ApPlEs (SALE)");
      expect(result).toEqual({
        normalizedName: "Organic Apples",
        isSale: true,
      });
      expect(capitalizeWords).toHaveBeenCalledWith("OrGaNiC ApPlEs");
    });
  });
});
