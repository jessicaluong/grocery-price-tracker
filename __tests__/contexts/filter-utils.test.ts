import {
  findItems,
  sortByPrice,
  sortByDate,
  sortItems,
  groupItems,
  getFilteredItemsWithView,
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
      ];

      const result = sortByDate(items[0], items[1]);
      expect(result).toBeGreaterThan(0);
    });

    it("should sort items in descending date order (most recent first) - different months", () => {
      const items = [
        { id: "1", date: new Date("2024-10-14") },
        { id: "2", date: new Date("2024-09-15") },
      ];

      const result = sortByDate(items[0], items[1]);
      expect(result).toBeLessThan(0);
    });

    it("should sort items in descending date order (most recent first) - different years", () => {
      const items = [
        { id: "1", date: new Date("2024-10-14") },
        { id: "2", date: new Date("2020-09-15") },
      ];

      const result = sortByDate(items[0], items[1]);
      expect(result).toBeLessThan(0);
    });

    it("should handle same dates", () => {
      const items = [
        { id: "1", date: new Date("2024-09-14") },
        { id: "2", date: new Date("2024-09-14") },
      ];

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

      const result = sortItems(items, "Newest Date");
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

      const result = sortItems(items, "Newest Date");
      expect(result).toEqual([items[0]]);
    });

    it("should handle empty array", () => {
      const result = sortItems([], "Newest Date");
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

  describe("groupItems", () => {
    const baseItem = {
      id: "1",
      groupId: "1",
    } as GroceryItem;

    describe("price range calculations ", () => {
      it("should calculate correct price range for grouped items", () => {
        const items = [
          { ...baseItem, id: "1", price: 1.5 },
          { ...baseItem, id: "2", price: 2.99 },
          { ...baseItem, id: "3", price: 2.5 },
        ];

        const result = groupItems(items);
        expect(result[0].minPrice).toEqual(1.5);
        expect(result[0].maxPrice).toEqual(2.99);
      });

      it("should handle single item price range", () => {
        const items = [{ ...baseItem, id: "1", price: 1.99 }];

        const result = groupItems(items);
        expect(result[0].minPrice).toEqual(1.99);
        expect(result[0].maxPrice).toEqual(1.99);
      });

      it("should handle identical prices in range calculation", () => {
        const items = [
          { ...baseItem, id: "1", price: 1.99 },
          { ...baseItem, id: "2", price: 1.99 },
        ];

        const result = groupItems(items);
        expect(result[0].minPrice).toEqual(1.99);
        expect(result[0].maxPrice).toEqual(1.99);
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
    });
  });

  describe("getFilteredItemsWithView", () => {
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
      groupId: "1",
    };

    it("should return correct view type for list view", () => {
      const result = getFilteredItemsWithView(
        [baseItem],
        "",
        "Newest Date",
        "List All Items"
      );
      expect(result.view).toBe("LIST");
    });

    it("should return correct view type for group view", () => {
      const result = getFilteredItemsWithView(
        [baseItem],
        "",
        "Newest Date",
        "Group Items"
      );
      expect(result.view).toBe("GROUP");
    });

    describe("group ordering with sort modes", () => {
      it("should order grouped items by min price in each group when sort by Lowest Price", () => {
        const items = [
          { ...baseItem, id: "1", price: 4.99 },
          { ...baseItem, id: "2", price: 2.99 },
          {
            ...baseItem,
            id: "3",
            price: 3.5,
            groupId: "2",
          },
          {
            ...baseItem,
            id: "4",
            price: 3.99,
            groupId: "2",
          },
          {
            ...baseItem,
            id: "5",
            price: 0.99,
            groupId: "3",
          },
          {
            ...baseItem,
            id: "6",
            price: 1.95,
            groupId: "3",
          },
        ];
        const result = getFilteredItemsWithView(
          items,
          "",
          "Lowest Price",
          "Group Items"
        );
        expect(result.view).toBe("GROUP");
        expect(result.items).toHaveLength(3);
        expect(result.items[0].id).toBe("3");
        expect(result.items[1].id).toBe("1");
        expect(result.items[2].id).toBe("2");
      });

      it("should order grouped items by newest date in each group when sort by Newest Date", () => {
        const items = [
          { ...baseItem, id: "1", date: new Date("2024-01-01") },
          {
            ...baseItem,
            id: "2",
            date: new Date("2024-03-01"),
            groupId: "2",
          },
          {
            ...baseItem,
            id: "3",
            date: new Date("2024-02-01"),
            groupId: "3",
          },
          {
            ...baseItem,
            id: "4",
            date: new Date("2024-04-01"),
            groupId: "4",
          },
        ];
        const result = getFilteredItemsWithView(
          items,
          "",
          "Newest Date",
          "Group Items"
        );

        expect(result.view).toBe("GROUP");
        expect(result.items).toHaveLength(4);
        expect(result.items[0].id).toBe("4");
        expect(result.items[1].id).toBe("2");
        expect(result.items[2].id).toBe("3");
        expect(result.items[3].id).toBe("1");
      });
    });

    xdescribe("search, sort and group", () => {
      const items = [
        {
          ...baseItem,
          name: "orange juice",
          price: 3.99,
          date: new Date("2024-03-01"),
        },
        {
          ...baseItem,
          name: "orange soda",
          price: 2.99,
          date: new Date("2024-01-01"),
        },
        {
          ...baseItem,
          name: "apple juice",
          price: 1.99,
          date: new Date("2024-02-01"),
        },
      ];

      it("should filter and sort by price in list view", () => {
        const result = getFilteredItemsWithView(
          items,
          "orange",
          "Lowest Price",
          "List All Items"
        );

        expect(result.view).toBe("LIST");
        expect(result.items).toHaveLength(2); // Only orange items
        expect(result.items[0].name).toBe("orange soda"); // Cheaper orange item first
        expect(result.items[1].name).toBe("orange juice");
      });

      it("should filter and sort by date in list view", () => {
        const result = getFilteredItemsWithView(
          items,
          "orange",
          "Newest Date",
          "List All Items"
        );

        expect(result.view).toBe("LIST");
        expect(result.items).toHaveLength(2); // Only orange items
        expect(result.items[0].name).toBe("orange juice"); // Most recent orange item first
        expect(result.items[1].name).toBe("orange soda");
      });

      it("should filter and sort by price in group view", () => {
        const result = getFilteredItemsWithView(
          items,
          "orange",
          "Lowest Price",
          "Group Items"
        );

        expect(result.view).toBe("GROUP");
        if (result.view === "GROUP") {
          expect(result.items).toHaveLength(2); // Only orange items
          expect(result.items[0].name).toBe("orange soda"); // Cheaper orange item first
          expect(result.items[1].name).toBe("orange juice");
        }
      });

      it("should filter and sort by date in group view", () => {
        const result = getFilteredItemsWithView(
          items,
          "orange",
          "Newest Date",
          "Group Items"
        );

        expect(result.view).toBe("GROUP");
        if (result.view === "GROUP") {
          expect(result.items).toHaveLength(2); // Only orange items
          expect(result.items[0].name).toBe("orange juice"); // Most recent orange item first
          expect(result.items[1].name).toBe("orange soda");
        }
      });
    });

    describe("edge cases", () => {
      it("should handle empty initial items", () => {
        const result = getFilteredItemsWithView(
          [],
          "apple",
          "Newest Date",
          "List All Items"
        );
        expect(result.items).toHaveLength(0);
      });

      it("should return all items when no search query", () => {
        const result = getFilteredItemsWithView(
          [baseItem],
          "",
          "Newest Date",
          "List All Items"
        );
        expect(result.items).toHaveLength(1);
      });

      it("should handle no search results", () => {
        const result = getFilteredItemsWithView(
          [baseItem],
          "nonexistent",
          "Newest Date",
          "List All Items"
        );
        expect(result.items).toHaveLength(0);
      });
    });
  });
});
