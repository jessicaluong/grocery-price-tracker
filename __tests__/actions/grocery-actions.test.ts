import { addItemAction } from "@/actions/grocery-actions";
import { addItem } from "@/data-access/item-repository";
import { Unit } from "@/lib/types";
import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";

jest.mock("@/data-access/item-repository", () => ({
  addItem: jest.fn(),
}));

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: jest.fn(),
}));

describe("addItemAction", () => {
  const mockSession = {
    user: { id: "test-user-id", email: "test@example.com" },
  };

  beforeEach(() => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe("authentication", () => {
    it("should return an error if user is not authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const result = await addItemAction({
        name: "Test Name",
        brand: "Test Brand",
        store: "Test Store",
        count: 1,
        amount: 100,
        unit: "mL",
        price: 4.99,
        date: new Date(),
        isSale: false,
      });

      expect(result).toHaveProperty("errors");
      expect(result.errors).toHaveProperty(
        "form",
        "You must be logged in to add an item"
      );
      expect(addItem).not.toHaveBeenCalled();
    });

    it("should return an error if user id is missing", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: "test@example.com" },
      });

      const result = await addItemAction({
        name: "Test Name",
        brand: "Test Brand",
        store: "Test Store",
        count: 1,
        amount: 100,
        unit: "mL",
        price: 4.99,
        date: new Date(),
        isSale: false,
      });

      expect(result).toHaveProperty("errors");
      expect(result.errors).toHaveProperty(
        "form",
        "You must be logged in to add an item"
      );
      expect(addItem).not.toHaveBeenCalled();
    });
  });

  describe("validation", () => {
    describe("name", () => {
      it("should return validation errors for empty name", async () => {
        const result = await addItemAction({
          name: "",
          brand: "Test Brand",
          store: "Test Store",
          count: 1,
          amount: 100,
          unit: "mL",
          price: 4.99,
          date: new Date(),
          isSale: false,
        });

        expect(result).toHaveProperty("errors");
        expect(result.errors).toHaveProperty("name");
        expect(addItem).not.toHaveBeenCalled();
      });

      it("should return validation errors for name exceeding 50 characters", async () => {
        const tooLongName = "a".repeat(51);

        const result = await addItemAction({
          name: tooLongName,
          brand: "Test Brand",
          store: "Test Store",
          count: 1,
          amount: 100,
          unit: "mL",
          price: 4.99,
          date: new Date(),
          isSale: false,
        });

        expect(result).toHaveProperty("errors");
        if (result.errors && "name" in result.errors) {
          expect(result.errors.name).toContain("Item name too long");
        } else {
          fail(`Expected name validation error`);
        }
        expect(addItem).not.toHaveBeenCalled();
      });
    });

    describe("brand", () => {
      it("should return validation errors for brand exceeding 50 characters", async () => {
        const tooLongBrand = "a".repeat(51);

        const result = await addItemAction({
          name: "Test Name",
          brand: tooLongBrand,
          store: "Test Store",
          count: 1,
          amount: 100,
          unit: "mL",
          price: 4.99,
          date: new Date(),
          isSale: false,
        });

        expect(result).toHaveProperty("errors");
        if (result.errors && "brand" in result.errors) {
          expect(result.errors.brand).toContain("Brand name too long");
        } else {
          fail(`Expected brand validation error`);
        }
        expect(addItem).not.toHaveBeenCalled();
      });
    });

    describe("store", () => {
      it("should return validation errors for empty store", async () => {
        const result = await addItemAction({
          name: "Test Name",
          brand: "Test Brand",
          store: "",
          count: 1,
          amount: 100,
          unit: "mL",
          price: 4.99,
          date: new Date(),
          isSale: false,
        });

        expect(result).toHaveProperty("errors");
        expect(result.errors).toHaveProperty("store");
        expect(addItem).not.toHaveBeenCalled();
      });

      it("should return validation errors for store exceeding 50 characters", async () => {
        const tooLongStore = "a".repeat(51);

        const result = await addItemAction({
          name: "Test Name",
          brand: "Test Brand",
          store: tooLongStore,
          count: 1,
          amount: 100,
          unit: "mL",
          price: 4.99,
          date: new Date(),
          isSale: false,
        });

        expect(result).toHaveProperty("errors");
        if (result.errors && "store" in result.errors) {
          expect(result.errors.store).toContain("Store name too long");
        } else {
          fail(`Expected store validation error`);
        }
        expect(addItem).not.toHaveBeenCalled();
      });
    });

    describe("count", () => {
      it("should return validation errors for non-numeric count", async () => {
        const result = await addItemAction({
          name: "Test Name",
          brand: "Test Brand",
          store: "Test Store",
          count: "string",
          amount: 100,
          unit: "mL",
          price: 4.99,
          date: new Date(),
          isSale: false,
        });

        expect(result).toHaveProperty("errors");
        expect(result.errors).toHaveProperty("count");
        expect(addItem).not.toHaveBeenCalled();
      });

      it("should return validation errors for negative count", async () => {
        const result = await addItemAction({
          name: "Test Name",
          brand: "Test Brand",
          store: "Test Store",
          count: -1,
          amount: 100,
          unit: "mL",
          price: 4.99,
          date: new Date(),
          isSale: false,
        });

        expect(result).toHaveProperty("errors");
        expect(result.errors).toHaveProperty("count");
        expect(addItem).not.toHaveBeenCalled();
      });

      it("should return validation errors for non-integer count", async () => {
        const result = await addItemAction({
          name: "Test Name",
          brand: "Test Brand",
          store: "Test Store",
          count: 1.5,
          amount: 100,
          unit: "mL",
          price: 4.99,
          date: new Date(),
          isSale: false,
        });

        expect(result).toHaveProperty("errors");
        expect(result.errors).toHaveProperty("count");
        expect(addItem).not.toHaveBeenCalled();
      });

      it("should return validation errors for zero count", async () => {
        const result = await addItemAction({
          name: "Test Name",
          brand: "Test Brand",
          store: "Test Store",
          count: 0,
          amount: 100,
          unit: "mL",
          price: 4.99,
          date: new Date(),
          isSale: false,
        });

        expect(result).toHaveProperty("errors");
        expect(result.errors).toHaveProperty("count");
        expect(addItem).not.toHaveBeenCalled();
      });
    });

    describe("amount", () => {
      it("should return validation errors for non-numeric amount", async () => {
        const result = await addItemAction({
          name: "Test Name",
          brand: "Test Brand",
          store: "Test Store",
          count: 1,
          amount: "string",
          unit: "mL",
          price: 4.99,
          date: new Date(),
          isSale: false,
        });

        expect(result).toHaveProperty("errors");
        expect(result.errors).toHaveProperty("amount");
        expect(addItem).not.toHaveBeenCalled();
      });

      it("should return validation errors for negative amount", async () => {
        const result = await addItemAction({
          name: "Test Name",
          brand: "Test Brand",
          store: "Test Store",
          count: 1,
          amount: -1,
          unit: "mL",
          price: 4.99,
          date: new Date(),
          isSale: false,
        });

        expect(result).toHaveProperty("errors");
        expect(result.errors).toHaveProperty("amount");
        expect(addItem).not.toHaveBeenCalled();
      });

      it("should return validation errors for non-integer amount", async () => {
        const result = await addItemAction({
          name: "Test Name",
          brand: "Test Brand",
          store: "Test Store",
          count: 1,
          amount: 100.5,
          unit: "mL",
          price: 4.99,
          date: new Date(),
          isSale: false,
        });

        expect(result).toHaveProperty("errors");
        expect(result.errors).toHaveProperty("amount");
        expect(addItem).not.toHaveBeenCalled();
      });

      it("should return validation errors for zero amount", async () => {
        const result = await addItemAction({
          name: "Test Name",
          brand: "Test Brand",
          store: "Test Store",
          count: 1,
          amount: 0,
          unit: "mL",
          price: 4.99,
          date: new Date(),
          isSale: false,
        });

        expect(result).toHaveProperty("errors");
        expect(result.errors).toHaveProperty("amount");
        expect(addItem).not.toHaveBeenCalled();
      });
    });

    describe("unit", () => {
      it("should return validation errors for invalid unit", async () => {
        const result = await addItemAction({
          name: "Test Name",
          brand: "Test Brand",
          store: "Test Store",
          count: 1,
          amount: 100,
          unit: "invalidUnit" as Unit,
          price: 4.99,
          date: new Date(),
          isSale: false,
        });

        expect(result).toHaveProperty("errors");
        expect(result.errors).toHaveProperty("unit");
        expect(addItem).not.toHaveBeenCalled();
      });
    });

    describe("date", () => {
      it("should return validation errors for missing date", async () => {
        const result = await addItemAction({
          name: "Test Name",
          brand: "Test Brand",
          store: "Test Store",
          count: 1,
          amount: 100,
          unit: "mL",
          price: 4.99,
          date: undefined as unknown as Date,
          isSale: false,
        });

        expect(result).toHaveProperty("errors");
        expect(result.errors).toHaveProperty("date");
        expect(addItem).not.toHaveBeenCalled();
      });
    });

    describe("price", () => {
      it("should return validation errors for non-numeric price", async () => {
        const result = await addItemAction({
          name: "Test Name",
          brand: "Test Brand",
          store: "Test Store",
          count: 1,
          amount: 100,
          unit: "mL",
          price: "string",
          date: new Date(),
          isSale: false,
        });

        expect(result).toHaveProperty("errors");
        expect(result.errors).toHaveProperty("price");
        expect(addItem).not.toHaveBeenCalled();
      });

      it("should return validation errors for negative price", async () => {
        const result = await addItemAction({
          name: "Test Name",
          brand: "Test Brand",
          store: "Test Store",
          count: 1,
          amount: 100,
          unit: "mL",
          price: -1,
          date: new Date(),
          isSale: false,
        });

        expect(result).toHaveProperty("errors");
        expect(result.errors).toHaveProperty("price");
        expect(addItem).not.toHaveBeenCalled();
      });
    });

    it("should return validation errors when multiple fields are invalid", async () => {
      const result = await addItemAction({
        name: "",
        brand: "Test Brand",
        store: "",
        count: -1,
        amount: 100,
        unit: "mL",
        price: 4.99,
        date: new Date(),
        isSale: false,
      });

      expect(result).toHaveProperty("errors");
      expect(result.errors).toHaveProperty("name");
      expect(result.errors).toHaveProperty("store");
      expect(result.errors).toHaveProperty("count");
      expect(addItem).not.toHaveBeenCalled();
    });
  });

  describe("brand normalization", () => {
    it("should handle empty brand as null", async () => {
      const emptyBrand = "";
      const normalizedBrand = null;

      const testData = {
        name: "Test Item",
        brand: emptyBrand,
        store: "Test Store",
        count: 1,
        amount: 100,
        unit: "mL",
        price: 4.99,
        date: new Date(),
        isSale: false,
      };

      const result = await addItemAction(testData);

      expect(result).toEqual({ success: true });
      expect(addItem).toHaveBeenCalledWith({
        ...testData,
        brand: normalizedBrand,
        userId: "test-user-id",
      });
    });
  });

  describe("successful submission", () => {
    it("should return success true for valid complete data", async () => {
      const testData = {
        name: "Test Name",
        brand: "Test Brand",
        store: "Test Store",
        count: 1,
        amount: 100,
        unit: "mL",
        price: 4.99,
        date: new Date(),
        isSale: false,
      };

      const result = await addItemAction(testData);

      expect(result).toEqual({ success: true });
      expect(addItem).toHaveBeenCalledWith({
        ...testData,
        userId: "test-user-id",
      });
      expect(revalidatePath).toHaveBeenCalledWith("/groceries");
    });

    it("trims whitespace from strings", async () => {
      const testData = {
        name: "  Test Name  ",
        brand: "  Test Brand  ",
        store: "     Test Store ",
        count: 1,
        amount: 100,
        unit: "mL",
        price: 4.99,
        date: new Date(),
        isSale: false,
      };

      const result = await addItemAction(testData);

      expect(result).toEqual({ success: true });
      expect(addItem).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test Name",
          brand: "Test Brand",
          store: "Test Store",
          userId: "test-user-id",
        })
      );
    });

    it("should handle nullable brand field", async () => {
      const testData = {
        name: "Test Name",
        brand: null,
        store: "Test Store",
        count: 1,
        amount: 100,
        unit: "mL",
        price: 4.99,
        date: new Date(),
        isSale: false,
      };

      const result = await addItemAction(testData);

      expect(result).toEqual({ success: true });
      expect(addItem).toHaveBeenCalledWith({
        ...testData,
        userId: "test-user-id",
      });
    });

    it("should round price to 2 decimal places", async () => {
      const testData = {
        name: "Test Item",
        brand: "Test Brand",
        store: "Test Store",
        count: 1,
        amount: 100,
        unit: "mL",
        price: 4.999,
        date: new Date(),
        isSale: false,
      };

      const result = await addItemAction(testData);

      expect(result).toEqual({ success: true });
      expect(addItem).toHaveBeenCalledWith({
        ...testData,
        price: 5.0,
        userId: "test-user-id",
      });
    });

    it("should handle zero price", async () => {
      const testData = {
        name: "Test Item",
        brand: "Test Brand",
        store: "Test Store",
        count: 1,
        amount: 100,
        unit: "mL",
        price: 0,
        date: new Date(),
        isSale: false,
      };

      const result = await addItemAction(testData);

      expect(result).toEqual({ success: true });
      expect(addItem).toHaveBeenCalledWith({
        ...testData,
        price: 0,
        userId: "test-user-id",
      });
    });

    it("should handle undefined values correctly", async () => {
      const testData = {
        name: "Test Item",
        brand: "Test Brand",
        store: "Test Store",
        // count is not provided but has default value
        amount: 100,
        unit: "mL",
        price: 4.99,
        date: new Date(),
        // isSale is not provided but has default value
      };

      const result = await addItemAction(testData);

      expect(result).toEqual({ success: true });
      expect(addItem).toHaveBeenCalledWith({
        ...testData,
        count: 1,
        isSale: false,
        userId: "test-user-id",
      });
    });
  });

  describe("error handling", () => {
    it("should handle repository errors gracefully", async () => {
      (addItem as jest.Mock).mockRejectedValue(new Error("Database error"));

      const result = await addItemAction({
        name: "Test Item",
        brand: "Test Brand",
        store: "Test Store",
        count: 1,
        amount: 100,
        unit: "mL",
        price: 4.99,
        date: new Date(),
        isSale: false,
      });

      expect(result).toHaveProperty("errors");
      expect(result.errors).toHaveProperty("form", "Failed to add item");
    });
  });
});
