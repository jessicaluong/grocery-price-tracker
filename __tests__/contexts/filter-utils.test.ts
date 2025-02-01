import {
  findItems,
  sortByPrice,
  sortByDate,
  sortItems,
  groupItems,
  getGroupKey,
  formatString,
} from "@/contexts/filter-utils";
import { GroceryItem } from "@/lib/types";

describe("FilterUtils", () => {
  describe("sortByPrice", () => {
    it("should sort items in ascending price order (cheapest first)", () => {
      const items = [
        { id: "1", price: 2.0 },
        { id: "2", price: 1.5 },
      ] as GroceryItem[];

      const result = sortByPrice(items[0], items[1]);
      expect(result).toBe(0.5);
    });

    it("should handle equal prices", () => {
      const items = [
        { id: "1", price: 2.0 },
        { id: "2", price: 2.0 },
      ] as GroceryItem[];

      const result = sortByPrice(items[0], items[1]);
      expect(result).toBe(0);
    });
  });

  describe("sortByDate", () => {
    it("should sort items in descending date order (most recent first) - different days", () => {
      const items = [
        { id: "1", date: new Date("2024-09-14") },
        { id: "2", date: new Date("2024-09-15") },
      ] as GroceryItem[];

      const result = sortByDate(items[0], items[1]);
      expect(result).toBeGreaterThan(0);
    });

    it("should sort items in descending date order (most recent first) - different months", () => {
      const items = [
        { id: "1", date: new Date("2024-10-14") },
        { id: "2", date: new Date("2024-09-15") },
      ] as GroceryItem[];

      const result = sortByDate(items[0], items[1]);
      expect(result).toBeLessThan(0);
    });

    it("should sort items in descending date order (most recent first) - different years", () => {
      const items = [
        { id: "1", date: new Date("2024-10-14") },
        { id: "2", date: new Date("2020-09-15") },
      ] as GroceryItem[];

      const result = sortByDate(items[0], items[1]);
      expect(result).toBeLessThan(0);
    });

    it("should handle same dates", () => {
      const items = [
        { id: "1", date: new Date("2024-09-14") },
        { id: "2", date: new Date("2024-09-14") },
      ] as GroceryItem[];

      const result = sortByDate(items[0], items[1]);
      expect(result).toBe(0);
    });
  });

  describe("sortItems", () => {
    const items = [
      { id: "1", price: 4.27, date: new Date("2024-09-14") },
      { id: "2", price: 4, date: new Date("2024-09-15") },
      { id: "3", price: 25.1, date: new Date("2024-09-12") },
    ] as GroceryItem[];

    it("should sort multiple items by price correctly", () => {
      const items = [
        { id: "1", price: 3.0 },
        { id: "2", price: 1.5 },
        { id: "3", price: 2.0 },
        { id: "4", price: 2.99 },
        { id: "5", price: 2.1 },
      ] as GroceryItem[];

      const result = sortItems(items, "Lowest Price");
      expect(result).toEqual([
        items[1],
        items[2],
        items[4],
        items[3],
        items[0],
      ]);
    });

    it("should sort multiple items by date correctly", () => {
      const items = [
        { id: "1", date: new Date("2024-01-01") },
        { id: "2", date: new Date("1999-02-01") },
        { id: "3", date: new Date("2024-01-10") },
        { id: "4", date: new Date("2023-01-01") },
        { id: "5", date: new Date("2022-07-23") },
      ] as GroceryItem[];

      const result = sortItems(items, "Recently Added");
      expect(result).toEqual([
        items[2],
        items[0],
        items[3],
        items[4],
        items[1],
      ]);
    });

    it("should handle single item", () => {
      const items = [
        { id: "1", date: new Date("2024-01-01") },
      ] as GroceryItem[];

      const result = sortItems(items, "Recently Added");
      expect(result).toEqual([items[0]]);
    });

    it("should handle empty array", () => {
      const result = sortItems([], "Recently Added");
      expect(result).toStrictEqual([]);
    });

    it("should maintain original array immutability", () => {
      const original = [
        { id: "1", price: 2.0 },
        { id: "2", price: 1.5 },
      ] as GroceryItem[];
      const originalCopy = [...original];

      sortItems(original, "Lowest Price");
      expect(original).toEqual(originalCopy);
    });
  });

  describe("findItems", () => {
    const items = [
      { id: "1", name: "orange juice", brand: "Tropicana" },
      { id: "2", name: "oats", brand: "Quaker" },
      { id: "3", name: "orange soda", brand: "Fanta" },
    ] as GroceryItem[];

    it("should find items by name", () => {
      const result = findItems(items, "orange juice");
      expect(result).toHaveLength(1);
      expect(result).toEqual([items[0]]);
    });

    it("should find items by brand", () => {
      const result = findItems(items, "tropicana");
      expect(result).toHaveLength(1);
      expect(result).toEqual([items[0]]);
    });

    it("should find items by name and brand", () => {
      const result = findItems(items, "orange juice tropicana");
      expect(result).toHaveLength(1);
      expect(result).toEqual([items[0]]);
    });

    it("should return all items for empty search query", () => {
      const result = findItems(items, "");
      expect(result).toHaveLength(3);
      expect(result).toEqual(items);
    });

    it("should return no items for non-matching query", () => {
      const result = findItems(items, "banana");
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("should match items with missing brand", () => {
      const itemsWithMissingBrand = [
        ...items,
        { id: "4", name: "bok choy" },
      ] as GroceryItem[];
      const result = findItems(itemsWithMissingBrand, "choy");
      expect(result).toHaveLength(1);
      expect(result).toEqual([itemsWithMissingBrand[3]]);
    });

    it("should find multiple items", () => {
      const result = findItems(items, "orange");
      expect(result).toHaveLength(2);
      expect(result).toEqual([items[0], items[2]]);
    });

    it("should return no items if grocery list is empty", () => {
      const result = findItems([], "orange");
      expect(result).toHaveLength(0);
    });

    it("should include duplicates when name and brand match", () => {
      const itemsWithDuplicate = [
        ...items,
        { id: "4", name: "orange juice", brand: "Tropicana" },
      ] as GroceryItem[];
      const result = findItems(itemsWithDuplicate, "orange tropicana");
      expect(result).toHaveLength(2);
      expect(result).toEqual([itemsWithDuplicate[0], itemsWithDuplicate[3]]);
    });
  });

  describe("formatString", () => {
    it("should remove inner whitespaces", () => {
      const result = formatString("orange juice");
      expect(result).toEqual("orangejuice");
    });

    it("should remove outer whitespaces", () => {
      const result = formatString("   orange ");
      expect(result).toEqual("orange");
    });

    it("should make string lowercase", () => {
      const result = formatString("ORangE");
      expect(result).toEqual("orange");
    });

    it("should handle null", () => {
      const result = formatString(null);
      expect(result).toEqual("");
    });
  });

  describe("getGroupKey", () => {
    const baseItem = {
      id: "1",
      name: "orange",
      brand: "Tropicana",
      store: "Walmart",
      count: 1,
      amount: 100,
      unit: "mL" as const,
      price: 4,
      date: new Date("2024-09-15"),
      isSale: true,
    };

    it("should create correct key for item", () => {
      const result = getGroupKey(baseItem);
      expect(result).toEqual("orange-tropicana-walmart-1-100-ml");
    });

    it("should handle white spaces", () => {
      const item = { ...baseItem, name: "orange juice" };
      const result = getGroupKey(item);
      expect(result).toEqual("orangejuice-tropicana-walmart-1-100-ml");
    });

    it("should handle items with no brand", () => {
      const item = { ...baseItem, brand: null };
      const result = getGroupKey(item);
      expect(result).toEqual("orange--walmart-1-100-ml");
    });

    it("should handle items with brand called null", () => {
      const item = { ...baseItem, brand: "null" };
      const result = getGroupKey(item);
      expect(result).toEqual("orange-null-walmart-1-100-ml");
    });
  });

  describe("groupItems", () => {
    const baseItem = {
      id: "1",
      name: "orange juice",
      brand: "Tropicana",
      store: "Walmart",
      count: 1,
      amount: 100,
      unit: "mL" as const,
      price: 4,
      date: new Date("2024-09-15"),
      isSale: true,
    };

    describe("grouping criteria", () => {
      it("should group identical items together", () => {
        const items = [
          { ...baseItem, id: "1" },
          { ...baseItem, id: "2" },
        ];

        const result = groupItems(items);
        expect(result).toHaveLength(1);
      });

      it("should separate items with different names", () => {
        const items = [
          { ...baseItem, id: "1", name: "orange juice" },
          { ...baseItem, id: "2", name: "apple juice" },
        ];

        const result = groupItems(items);
        expect(result).toHaveLength(2);
      });

      it("should separate items with different brand", () => {
        const items = [
          { ...baseItem, id: "1", brand: "Tropicana" },
          { ...baseItem, id: "2", brand: "Minute Maid" },
        ];

        const result = groupItems(items);
        expect(result).toHaveLength(2);
      });

      it("should separate items with different stores", () => {
        const items = [
          { ...baseItem, id: "1", brand: "Walmart" },
          { ...baseItem, id: "2", brand: "Superstore" },
        ];

        const result = groupItems(items);
        expect(result).toHaveLength(2);
      });

      it("should separate items with different counts", () => {
        const items = [
          { ...baseItem, id: "1", count: 8 },
          { ...baseItem, id: "2", count: 4 },
        ];

        const result = groupItems(items);
        expect(result).toHaveLength(2);
      });

      it("should separate items with different amounts", () => {
        const items = [
          { ...baseItem, id: "1", amount: 100 },
          { ...baseItem, id: "2", amount: 500 },
        ];

        const result = groupItems(items);
        expect(result).toHaveLength(2);
      });

      it("should separate items with different units", () => {
        const items = [
          { ...baseItem, id: "1", unit: "mL" as const },
          { ...baseItem, id: "2", unit: "L" as const },
        ];

        const result = groupItems(items);
        expect(result).toHaveLength(2);
      });
    });

    describe("properties that should not affect grouping", () => {
      it("should group items with different dates together", () => {
        const items = [
          { ...baseItem, id: "1", date: new Date("2024-01-01") },
          { ...baseItem, id: "2", date: new Date("2024-02-01") },
        ];

        const result = groupItems(items);
        expect(result).toHaveLength(1);
      });

      it("should group items with different sale status together", () => {
        const items = [
          { ...baseItem, id: "1", isSale: true },
          { ...baseItem, id: "2", isSale: false },
        ];

        const result = groupItems(items);
        expect(result).toHaveLength(1);
      });

      it("should group items with different prices together", () => {
        const items = [
          { ...baseItem, id: "1", price: 1.99 },
          { ...baseItem, id: "2", price: 2.99 },
        ];

        const result = groupItems(items);
        expect(result).toHaveLength(1);
      });
    });

    describe("price range calculations ", () => {
      it("should calculate correct price range for grouped items", () => {
        const items = [
          { ...baseItem, id: "1", price: 1.5 },
          { ...baseItem, id: "2", price: 2.99 },
          { ...baseItem, id: "3", price: 2.5 },
        ];

        const result = groupItems(items);
        expect(result[0].priceRange).toEqual({ min: 1.5, max: 2.99 });
      });

      it("should handle single item price range", () => {
        const items = [{ ...baseItem, id: "1", price: 1.99 }];

        const result = groupItems(items);
        expect(result[0].priceRange).toEqual({ min: 1.99, max: 1.99 });
      });

      it("should handle identical prices in range calculation", () => {
        const items = [
          { ...baseItem, id: "1", price: 1.99 },
          { ...baseItem, id: "2", price: 1.99 },
        ];

        const result = groupItems(items);
        expect(result[0].priceRange).toEqual({ min: 1.99, max: 1.99 });
      });
    });

    describe("number of items calculations ", () => {
      it("should count number of items in a group", () => {
        const items = [
          { ...baseItem, id: "1" },
          { ...baseItem, id: "2" },
          { ...baseItem, id: "3" },
        ];

        const result = groupItems(items);
        expect(result[0].numberOfItems).toBe(3);
      });

      it("should handle single item count", () => {
        const items = [{ ...baseItem, id: "1" }];

        const result = groupItems(items);
        expect(result[0].numberOfItems).toBe(1);
      });
    });

    describe("edge cases", () => {
      it("should handle single item", () => {
        const result = groupItems([baseItem]);
        expect(result).toHaveLength(1);
      });

      it("should handle no items", () => {
        const result = groupItems([]);
        expect(result).toStrictEqual([]);
      });

      it("should handle null brands correctly", () => {
        const items = [
          { ...baseItem, id: "1", brand: null },
          { ...baseItem, id: "2", brand: null },
        ];

        const result = groupItems(items);
        expect(result).toHaveLength(1);
        expect(result[0].brand).toBeNull();
      });

      it("should handle case-insensitive matching", () => {
        const items = [
          { ...baseItem, id: "1", name: "Orange Juice" },
          { ...baseItem, id: "2", name: "orange juice" },
        ];
        const result = groupItems(items);
        expect(result).toHaveLength(1);
      });

      it("should handle extra spaces matching", () => {
        const items = [
          { ...baseItem, id: "1", name: "orange juice" },
          { ...baseItem, id: "2", name: "  orange    juice  " },
        ];
        const result = groupItems(items);
        expect(result).toHaveLength(1);
      });
    });
  });
});
