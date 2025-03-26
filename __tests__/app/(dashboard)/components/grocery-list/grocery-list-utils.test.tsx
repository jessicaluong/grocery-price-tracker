import {
  findItems,
  compareNumbersAscending,
  compareDatesDescending,
  sortItems,
  getFilteredItemsWithView,
  createGroupMap,
  findGroups,
  sortGroups,
  findByNameAndBrand,
} from "@/app/(dashboard)/groceries/components/grocery-list/grocery-list-utils";
import { GroceryItem, Unit } from "@/types/grocery";

describe("GroceryListUtils", () => {
  const baseItem = {
    id: "test-item-id-1",
    name: "orange juice",
    brand: "Tropicana",
    store: "Walmart",
    count: 1,
    amount: 100,
    unit: "mL" as Unit,
    price: 4,
    date: new Date("2024-09-15"),
    isSale: true,
    groupId: "test-group-id-1",
  };

  const baseGroup = {
    id: "test-group-id-1",
    name: "orange juice",
    brand: "Tropicana",
    store: "Walmart",
    count: 1,
    amount: 100,
    unit: "mL" as Unit,
    itemCount: BigInt(1),
    maxPrice: 4,
    minPrice: 4,
    newestDate: new Date("2024-09-15"),
  };

  describe("compareNumbersAscending", () => {
    it("should sort numbers in ascending order (lowest first)", () => {
      const result = compareNumbersAscending(2.0, 1.5);
      expect(result).toBe(0.5);
    });

    it("should handle equal values", () => {
      const result = compareNumbersAscending(2.0, 2.0);
      expect(result).toBe(0);
    });

    it("should handle negative numbers", () => {
      const result = compareNumbersAscending(-1.0, -2.0);
      expect(result).toBe(1);
    });

    it("should handle zero", () => {
      const result = compareNumbersAscending(0, 1.0);
      expect(result).toBe(-1);
    });
  });

  describe("compareDatesDescending", () => {
    it("should order items in descending date order (most recent first) - different days", () => {
      const items = [
        { id: "1", date: new Date("2024-09-14") },
        { id: "2", date: new Date("2024-09-15") },
      ];

      const result = compareDatesDescending(items[0], items[1]);
      expect(result).toBeGreaterThan(0);
    });

    it("should order items in descending date order (most recent first) - different months", () => {
      const items = [
        { id: "1", date: new Date("2024-10-14") },
        { id: "2", date: new Date("2024-09-15") },
      ];

      const result = compareDatesDescending(items[0], items[1]);
      expect(result).toBeLessThan(0);
    });

    it("should order items in descending date order (most recent first) - different years", () => {
      const items = [
        { id: "1", date: new Date("2024-10-14") },
        { id: "2", date: new Date("2020-09-15") },
      ];

      const result = compareDatesDescending(items[0], items[1]);
      expect(result).toBeLessThan(0);
    });

    it("should handle same dates", () => {
      const items = [
        { id: "1", date: new Date("2024-09-14") },
        { id: "2", date: new Date("2024-09-14") },
      ];

      const result = compareDatesDescending(items[0], items[1]);
      expect(result).toBe(0);
    });
  });

  describe("sortItems", () => {
    it("should sort items by converted price correctly", () => {
      const items = [
        {
          ...baseItem,
          count: 1,
          amount: 100,
          unit: "mL" as Unit,
          price: 4.0,
        },
        {
          ...baseItem,
          id: "test-item-id-2",
          count: 2,
          amount: 200,
          unit: "mL" as Unit,
          price: 5.0,
        },
      ];

      const result = sortItems(items, "cheapest");
      expect(result).toEqual([items[1], items[0]]);
    });

    it("should sort multiple items by date correctly", () => {
      const items = [
        { ...baseItem, date: new Date("2024-01-01") },
        { ...baseItem, id: "test-item-id-2", date: new Date("1999-02-01") },
        { ...baseItem, id: "test-item-id-3", date: new Date("2024-01-10") },
        { ...baseItem, id: "test-item-id-4", date: new Date("2023-01-01") },
        { ...baseItem, id: "test-item-id-5", date: new Date("2022-07-23") },
      ];

      const result = sortItems(items, "newest");
      expect(result).toEqual([
        items[2],
        items[0],
        items[3],
        items[4],
        items[1],
      ]);
    });

    it("should handle single item", () => {
      const items = [baseItem];

      const result = sortItems(items, "newest");
      expect(result).toEqual([items[0]]);
    });

    it("should handle empty array", () => {
      const result = sortItems([], "newest");
      expect(result).toStrictEqual([]);
    });

    it("should maintain original array immutability", () => {
      const original = [
        {
          ...baseItem,
          count: 1,
          amount: 100,
          unit: "mL" as Unit,
          price: 4.0,
        },
        {
          ...baseItem,
          id: "test-item-id-2",
          count: 1,
          amount: 1,
          unit: "L" as Unit,
          price: 5.0,
        },
      ];
      const originalCopy = [...original];

      sortItems(original, "cheapest");
      expect(original).toEqual(originalCopy);
    });
  });

  describe("findByNameAndBrand", () => {
    const items = [
      { id: "1", name: "orange juice", brand: "Tropicana" },
      { id: "2", name: "oats", brand: "Quaker" },
      { id: "3", name: "orange soda", brand: "Fanta" },
    ];

    it("should find items by name", () => {
      const result = findByNameAndBrand(items, "orange juice");
      expect(result).toHaveLength(1);
      expect(result).toEqual([items[0]]);
    });

    it("should find items by brand", () => {
      const result = findByNameAndBrand(items, "tropicana");
      expect(result).toHaveLength(1);
      expect(result).toEqual([items[0]]);
    });

    it("should find items by name and brand", () => {
      const result = findByNameAndBrand(items, "orange juice tropicana");
      expect(result).toHaveLength(1);
      expect(result).toEqual([items[0]]);
    });

    it("should return all items for empty search query", () => {
      const result = findByNameAndBrand(items, "");
      expect(result).toHaveLength(3);
      expect(result).toEqual(items);
    });

    it("should return no items for non-matching query", () => {
      const result = findByNameAndBrand(items, "banana");
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("should match items with missing brand", () => {
      const itemsWithMissingBrand = [
        ...items,
        { id: "4", name: "bok choy" },
      ] as GroceryItem[];
      const result = findByNameAndBrand(itemsWithMissingBrand, "choy");
      expect(result).toHaveLength(1);
      expect(result).toEqual([itemsWithMissingBrand[3]]);
    });

    it("should find multiple items", () => {
      const result = findByNameAndBrand(items, "orange");
      expect(result).toHaveLength(2);
      expect(result).toEqual([items[0], items[2]]);
    });

    it("should return no items if grocery list is empty", () => {
      const result = findByNameAndBrand([], "orange");
      expect(result).toHaveLength(0);
    });

    it("should include duplicates when name and brand match", () => {
      const itemsWithDuplicate = [
        ...items,
        { id: "4", name: "orange juice", brand: "Tropicana" },
      ] as GroceryItem[];
      const result = findByNameAndBrand(itemsWithDuplicate, "orange tropicana");
      expect(result).toHaveLength(2);
      expect(result).toEqual([itemsWithDuplicate[0], itemsWithDuplicate[3]]);
    });
  });

  describe("findItems", () => {
    const items = [
      {
        id: "test-item-id-1",
        name: "orange juice",
        brand: "Tropicana",
        store: "Walmart",
        count: 1,
        amount: 100,
        unit: "mL" as Unit,
        price: 4,
        date: new Date("2024-09-15"),
        isSale: true,
        groupId: "1",
      },
      {
        id: "test-item-id-2",
        name: "bok choy",
        brand: null,
        store: "PriceSmart",
        count: 1,
        amount: 250,
        unit: "mL" as Unit,
        price: 1.99,
        date: new Date("2024-09-10"),
        isSale: true,
        groupId: "2",
      },
      {
        id: "test-item-id",
        name: "apple juice",
        brand: "Simply Orange",
        store: "Costco",
        count: 2,
        amount: 500,
        unit: "mL" as Unit,
        price: 4.99,
        date: new Date("2023-05-11"),
        isSale: false,
        groupId: "3",
      },
    ];

    it("should return grocery items with matching name and brand", () => {
      const result = findItems(items, "orange");
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("orange juice");
      expect(result[1].name).toBe("apple juice");
    });
  });

  describe("findGroups", () => {
    const groups = [
      {
        id: "test-group-id-1",
        name: "orange juice",
        brand: "Tropicana",
        store: "Walmart",
        count: 1,
        amount: 100,
        unit: "mL" as Unit,
        itemCount: BigInt(1),
        maxPrice: 1.99,
        minPrice: 3.49,
        newestDate: new Date("2024-09-15"),
      },
      {
        id: "test-group-id-2",
        name: "bok choy",
        brand: null,
        store: "PriceSmart",
        count: 1,
        amount: 250,
        unit: "mL" as Unit,
        itemCount: BigInt(1),
        maxPrice: 3.5,
        minPrice: 5.5,
        newestDate: new Date("2024-09-10"),
      },
      {
        id: "test-group-id-3",
        name: "apple juice",
        brand: "Simply Orange",
        store: "Costco",
        count: 2,
        amount: 500,
        unit: "mL" as Unit,
        itemCount: BigInt(1),
        maxPrice: 4.99,
        minPrice: 4.99,
        newestDate: new Date("2023-05-11"),
      },
    ];

    it("should return grocery groups with matching name and brand", () => {
      const result = findGroups(groups, "orange");
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("orange juice");
      expect(result[1].name).toBe("apple juice");
    });
  });

  describe("createGroupMap", () => {
    describe("basic functionality", () => {
      it("should return an empty map when passed an empty array", () => {
        const result = createGroupMap([]);
        expect(result.size).toBe(0);
      });

      it("should create a map with a single entry for a single group", () => {
        const result = createGroupMap([baseGroup]);

        expect(result.size).toBe(1);
        expect(result.has("test-group-id-1")).toBe(true);
        expect(result.get("test-group-id-1")!.name).toBe("orange juice");
      });

      it("should create a map with multiple entries for multiple groups", () => {
        const groups = [
          {
            ...baseGroup,
            id: "test-group-id-1",
          },
          {
            ...baseGroup,
            id: "test-group-id-2",
            name: "apple juice",
          },
        ];

        const result = createGroupMap(groups);

        expect(result.size).toBe(2);
        expect(result.has("test-group-id-1")).toBe(true);
        expect(result.has("test-group-id-2")).toBe(true);
      });
    });

    describe("data transformation", () => {
      it("should convert itemCount from BigInt to Number", () => {
        const group = {
          ...baseGroup,
          itemCount: BigInt(10),
        };

        const result = createGroupMap([group]);

        expect(result.size).toBe(1);
        expect(result.has("test-group-id-1")).toBe(true);
        expect(typeof result.get("test-group-id-1")!.itemCount).toBe("number");
        expect(result.get("test-group-id-1")!.itemCount).toBe(10);
      });

      it("should handle zero itemCount", () => {
        const group = {
          ...baseGroup,
          itemCount: BigInt(0),
        };

        const result = createGroupMap([group]);

        expect(result.size).toBe(1);
        expect(result.has("test-group-id-1")).toBe(true);
        expect(result.get("test-group-id-1")!.itemCount).toBe(0);
      });
    });
  });

  describe("sortGroups", () => {
    describe("no items handling", () => {
      it("should place groups with zero itemCount at the end", () => {
        const emptyGroup = {
          ...baseGroup,
          itemCount: BigInt(0),
        };
        const nonEmptyGroup = {
          ...baseGroup,
          id: "test-group-id-2",
          itemCount: BigInt(5),
        };

        const result = sortGroups([emptyGroup, nonEmptyGroup], "cheapest");
        expect(result).toEqual([nonEmptyGroup, emptyGroup]);
      });

      it("should place groups with undefined itemCount at the end", () => {
        const undefinedItemCountGroup = {
          ...baseGroup,
          itemCount: null,
        };
        const definedItemCountGroup = {
          ...baseGroup,
          id: "test-group-id-2",
          itemCount: BigInt(5),
        };

        const result = sortGroups(
          [undefinedItemCountGroup, definedItemCountGroup],
          "cheapest"
        );
        expect(result).toEqual([
          definedItemCountGroup,
          undefinedItemCountGroup,
        ]);
      });

      it("should maintain original order when multiple groups are empty", () => {
        const emptyGroup1 = {
          ...baseGroup,
          itemCount: BigInt(0),
        };
        const emptyGroup2 = {
          ...baseGroup,
          id: "test-group-id-2",
          itemCount: BigInt(0),
        };

        const result = sortGroups([emptyGroup1, emptyGroup2], "cheapest");
        expect(result).toEqual([emptyGroup1, emptyGroup2]);
      });
    });

    describe("sort by cheapest price", () => {
      it("should sort groups by converted price correctly", () => {
        const groups = [
          {
            ...baseGroup,
            count: 1,
            amount: 100,
            unit: "mL" as Unit,
            price: 4.0,
          },
          {
            ...baseGroup,
            id: "test-group-id-2",
            count: 2,
            amount: 200,
            unit: "mL" as Unit,
            price: 5.0,
          },
        ];

        const result = sortGroups(groups, "cheapest");
        expect(result).toEqual([groups[1], groups[0]]);
      });
    });

    describe("sort by newest date", () => {
      it("should sort groups by date correctly", () => {
        const groups = [
          { ...baseGroup, newestDate: new Date("2024-01-01") },
          {
            ...baseGroup,
            id: "test-group-id-2",
            newestDate: new Date("1999-02-01"),
          },
          {
            ...baseGroup,
            id: "test-group-id-3",
            newestDate: new Date("2024-01-10"),
          },
          {
            ...baseGroup,
            id: "test-group-id-4",
            newestDate: new Date("2023-01-01"),
          },
          {
            ...baseGroup,
            id: "test-group-id-5",
            newestDate: new Date("2022-07-23"),
          },
        ];

        const result = sortGroups(groups, "newest");
        expect(result).toEqual([
          groups[2],
          groups[0],
          groups[3],
          groups[4],
          groups[1],
        ]);
      });
    });

    describe("edge cases", () => {
      it("should handle empty arrays", () => {
        const result = sortGroups([], "newest");
        expect(result).toStrictEqual([]);
      });

      it("should handle single group", () => {
        const groups = [baseGroup];

        const result = sortGroups(groups, "newest");
        expect(result).toEqual([groups[0]]);
      });

      it("should maintain original array immutability", () => {
        const original = [
          {
            ...baseGroup,
            count: 1,
            amount: 100,
            unit: "mL" as Unit,
            price: 4.0,
          },
          {
            ...baseGroup,
            id: "test-item-id-2",
            count: 1,
            amount: 1,
            unit: "L" as Unit,
            price: 5.0,
          },
        ];
        const originalCopy = [...original];

        sortGroups(original, "cheapest");
        expect(original).toEqual(originalCopy);
      });
    });
  });

  describe("getFilteredItemsWithView", () => {
    describe("view mode handling", () => {
      it("should return correct view type for list view", () => {
        const result = getFilteredItemsWithView(
          [baseItem],
          [baseGroup],
          "",
          "newest",
          "list"
        );
        expect(result.view).toBe("LIST");
      });

      it("should return correct view type for group view", () => {
        const result = getFilteredItemsWithView(
          [baseItem],
          [baseGroup],
          "",
          "newest",
          "group"
        );
        expect(result.view).toBe("GROUP");
      });
    });

    describe("integration with helper functions", () => {
      it("should include groupMap in the response for list view", () => {
        const result = getFilteredItemsWithView(
          [baseItem],
          [baseGroup],
          "",
          "newest",
          "list"
        );
        expect(result.groupMap).toBeDefined();
        expect(result.groupMap).toBeInstanceOf(Map);
        expect(result.groupMap.size).toBe(1);
        expect(result.groupMap.has("test-group-id-1")).toBe(true);
      });

      it("should include groupMap in the response for group view", () => {
        const result = getFilteredItemsWithView(
          [baseItem],
          [baseGroup],
          "",
          "newest",
          "group"
        );
        expect(result.groupMap).toBeDefined();
        expect(result.groupMap).toBeInstanceOf(Map);
        expect(result.groupMap.size).toBe(1);
        expect(result.groupMap.has("test-group-id-1")).toBe(true);
      });
    });

    describe("combined operations (search, sort and view mode)", () => {
      const items = [
        baseItem,
        {
          ...baseItem,
          id: "test-item-id-2",
          name: "apple juice",
          brand: "Minute Maid",
          groupId: "test-group-id-2",
          price: 3.99,
          date: new Date("2025-03-25"),
        },
        {
          ...baseItem,
          id: "test-item-id-3",
          name: "orange soda",
          brand: "Fanta",
          groupId: "test-group-id-3",
          price: 2.99,
          date: new Date("2023-02-11"),
        },
      ];

      const groups = [
        baseGroup,
        {
          ...baseGroup,
          id: "test-group-id-2",
          name: "apple juice",
          brand: "Minute Maid",
          minPrice: 3.99,
          maxPrice: 5.99,
          newestDate: new Date("2025-03-25"),
        },
        {
          ...baseGroup,
          id: "test-group-id-3",
          name: "orange soda",
          brand: "Fanta",
          minPrice: 2.99,
          maxPrice: 4.99,
          newestDate: new Date("2023-02-11"),
        },
      ];

      it("should filter and sort by price in list view", () => {
        const result = getFilteredItemsWithView(
          items,
          groups,
          "orange",
          "cheapest",
          "list"
        );

        expect(result.view).toBe("LIST");
        expect(result.items).toHaveLength(2); // Only orange items
        expect(result.items[0].name).toBe("orange soda"); // Cheaper orange item first
        expect(result.items[1].name).toBe("orange juice");
      });

      it("should filter and sort by date in list view", () => {
        const result = getFilteredItemsWithView(
          items,
          groups,
          "orange",
          "newest",
          "list"
        );

        expect(result.view).toBe("LIST");
        expect(result.items).toHaveLength(2); // Only orange items
        expect(result.items[0].name).toBe("orange juice"); // Most recent orange item first
        expect(result.items[1].name).toBe("orange soda");
      });

      it("should filter and sort by price in group view", () => {
        const result = getFilteredItemsWithView(
          items,
          groups,
          "orange",
          "cheapest",
          "group"
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
          groups,
          "orange",
          "newest",
          "group"
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
          [baseGroup],
          "orange",
          "newest",
          "list"
        );
        expect(result.items).toHaveLength(0);
      });

      it("should handle empty initial groups", () => {
        const result = getFilteredItemsWithView(
          [baseItem],
          [],
          "orange",
          "newest",
          "group"
        );
        expect(result.items).toHaveLength(0);
      });

      it("should return all items when no search query", () => {
        const result = getFilteredItemsWithView(
          [baseItem],
          [baseGroup],
          "",
          "newest",
          "list"
        );
        expect(result.items).toHaveLength(1);
      });

      it("should return all groups when no search query", () => {
        const result = getFilteredItemsWithView(
          [baseItem],
          [baseGroup],
          "",
          "newest",
          "group"
        );
        expect(result.items).toHaveLength(1);
      });

      it("should handle no search results for items", () => {
        const result = getFilteredItemsWithView(
          [baseItem],
          [baseGroup],
          "nonexistent",
          "newest",
          "list"
        );
        expect(result.items).toHaveLength(0);
      });

      it("should handle no search results for groups", () => {
        const result = getFilteredItemsWithView(
          [baseItem],
          [baseGroup],
          "nonexistent",
          "newest",
          "group"
        );
        expect(result.items).toHaveLength(0);
      });
    });
  });
});
