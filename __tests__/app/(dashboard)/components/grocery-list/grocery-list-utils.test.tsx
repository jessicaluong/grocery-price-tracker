import {
  findItems,
  compareNumbersAscending,
  compareDatesDescending,
  sortItems,
  getFilteredItemsWithView,
  createGroupMap,
  findGroups,
  sortGroups,
  groupMapToArray,
} from "@/app/(dashboard)/groceries/components/grocery-list/grocery-list-utils";
import {
  GroceryGroup,
  GroceryItem,
  GroupMap,
  PricePoint,
} from "@/types/grocery";

describe("GroceryListUtils", () => {
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
          count: 1,
          amount: 100,
          unit: "mL",
          price: 4.0,
          date: new Date(),
        },
        {
          count: 2,
          amount: 200,
          unit: "mL",
          price: 5.0,
          date: new Date(),
        },
      ] as GroceryItem[];

      const result = sortItems(items, "cheapest");
      expect(result).toEqual([items[1], items[0]]);
    });

    it("should sort multiple items by date correctly", () => {
      const items = [
        { id: "1", date: new Date("2024-01-01") },
        { id: "2", date: new Date("1999-02-01") },
        { id: "3", date: new Date("2024-01-10") },
        { id: "4", date: new Date("2023-01-01") },
        { id: "5", date: new Date("2022-07-23") },
      ] as GroceryItem[];

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
      const items = [
        { id: "1", date: new Date("2024-01-01") },
      ] as GroceryItem[];

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
          count: 1,
          amount: 100,
          unit: "mL",
          price: 4.0,
          date: new Date(),
        },
        {
          count: 1,
          amount: 1,
          unit: "L",
          price: 5.0,
          date: new Date(),
        },
      ] as GroceryItem[];
      const originalCopy = [...original];

      sortItems(original, "cheapest");
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

  describe("createGroupMap", () => {
    const baseItem = {
      id: "1",
      groupId: "1",
      name: "orange juice",
      brand: "Tropicana",
      store: "Walmart",
      count: 1,
      amount: 100,
      unit: "mL" as const,
      price: 4,
      date: new Date("2024-09-15"),
      isSale: true,
    } as GroceryItem;

    describe("group items with same groupId", () => {
      it("should group items with the same groupId", () => {
        const items = [
          { ...baseItem, id: "1", groupId: "1" },
          { ...baseItem, id: "2", groupId: "2" },
          { ...baseItem, id: "3", groupId: "1" },
        ];

        const result = createGroupMap(items);
        expect(result).toBeInstanceOf(Map);
        expect(result.size).toBe(2);

        expect(result.has("1")).toBe(true);
        const group1 = result.get("1");
        expect(group1?.pricePoints.length).toBe(2);

        expect(result.has("2")).toBe(true);
        const group2 = result.get("2");
        expect(group2?.pricePoints.length).toBe(1);

        expect(group1?.name).toBe(baseItem.name);
        expect(group1?.brand).toBe(baseItem.brand);
        expect(group1?.store).toBe(baseItem.store);
      });
    });

    describe("price range calculations ", () => {
      it("should calculate correct price range for grouped items", () => {
        const items = [
          { ...baseItem, id: "1", price: 1.5 },
          { ...baseItem, id: "2", price: 2.99 },
          { ...baseItem, id: "3", price: 2.5 },
        ];

        const result = createGroupMap(items);
        const group1 = result.get("1");
        expect(group1?.minPrice).toBe(1.5);
        expect(group1?.maxPrice).toEqual(2.99);
      });

      it("should handle single item price range", () => {
        const items = [{ ...baseItem, id: "1", price: 1.99 }];

        const result = createGroupMap(items);
        const group1 = result.get("1");
        expect(group1?.minPrice).toBe(1.99);
        expect(group1?.maxPrice).toEqual(1.99);
      });

      it("should handle identical prices in range calculation", () => {
        const items = [
          { ...baseItem, id: "1", price: 1.99 },
          { ...baseItem, id: "2", price: 1.99 },
        ];

        const result = createGroupMap(items);
        const group1 = result.get("1");
        expect(group1?.minPrice).toBe(1.99);
        expect(group1?.maxPrice).toEqual(1.99);
      });
    });

    describe("date sorting within price points", () => {
      it("should sort price points by date with oldest first", () => {
        const items = [
          {
            ...baseItem,
            id: "1",
            date: new Date("2024-01-15"),
          },
          {
            ...baseItem,
            id: "2",
            date: new Date("2024-09-15"),
          },
          {
            ...baseItem,
            id: "3",
            date: new Date("2024-03-20"),
          },
        ];

        const result = createGroupMap(items);

        expect(result.has("1")).toBe(true);
        const group = result.get("1");
        expect(group).toBeDefined();
        expect(group?.pricePoints.length).toBe(3);

        const sortedPricePoints = group?.pricePoints as PricePoint[];

        expect(sortedPricePoints[0].date).toEqual(new Date("2024-01-15"));
        expect(sortedPricePoints[0].id).toBe("1");

        expect(sortedPricePoints[1].date).toEqual(new Date("2024-03-20"));
        expect(sortedPricePoints[1].id).toBe("3");

        expect(sortedPricePoints[2].date).toEqual(new Date("2024-09-15"));
        expect(sortedPricePoints[2].id).toBe("2");
      });

      it("should handle items with identical dates", () => {
        const items = [
          {
            ...baseItem,
            id: "1",
            date: new Date("2024-09-15"),
            price: 3.99,
          },
          {
            ...baseItem,
            id: "2",
            date: new Date("2024-09-15"),
            price: 4.29,
          },
        ];

        const result = createGroupMap(items);
        const group = result.get("1");
        expect(group?.pricePoints.length).toBe(2);

        expect(group?.pricePoints[0].date).toEqual(new Date("2024-09-15"));
        expect(group?.pricePoints[1].date).toEqual(new Date("2024-09-15"));
      });
    });

    describe("edge cases", () => {
      it("should handle single item", () => {
        const result = createGroupMap([baseItem]);
        expect(result.size).toBe(1);
        expect(result.has(baseItem.groupId)).toBe(true);

        const group = result.get(baseItem.groupId);
        expect(group).toBeDefined();
        expect(group?.pricePoints.length).toBe(1);
        expect(group?.minPrice).toBe(baseItem.price);
        expect(group?.maxPrice).toBe(baseItem.price);
      });

      it("should handle no items", () => {
        const result = createGroupMap([]);
        expect(result.size).toBe(0);
        expect(result).toBeInstanceOf(Map);
      });
    });
  });

  describe("findGroups", () => {
    const groupMap: GroupMap = new Map();

    const groups = [
      {
        name: "orange juice",
        brand: "Tropicana",
        store: "Walmart",
        count: 1,
        amount: 100,
        unit: "mL" as const,
        minPrice: 3.99,
        maxPrice: 4.29,
        pricePoints: [
          { id: "1", date: new Date("2024-09-15"), price: 4.29, isSale: false },
          { id: "2", date: new Date("2024-08-15"), price: 3.99, isSale: true },
        ],
      },
      {
        name: "oats",
        brand: "Quaker",
        store: "Costco",
        count: 1,
        amount: 1,
        unit: "L" as const,
        minPrice: 2.99,
        maxPrice: 3.49,
        pricePoints: [
          { id: "3", date: new Date("2024-09-10"), price: 3.49, isSale: false },
          { id: "4", date: new Date("2024-08-20"), price: 2.99, isSale: true },
        ],
      },
      {
        name: "orange soda",
        brand: "Fanta",
        store: "Whole Foods",
        count: 1,
        amount: 2,
        unit: "L" as const,
        minPrice: 5.99,
        maxPrice: 5.99,
        pricePoints: [
          { id: "5", date: new Date("2024-09-05"), price: 5.99, isSale: false },
        ],
      },
    ];

    groupMap.set("1", groups[0]);
    groupMap.set("2", groups[1]);
    groupMap.set("3", groups[2]);

    it("should find groups by name", () => {
      const result = findGroups(groupMap, "juice");
      expect(result.size).toBe(1);
      expect(result.has("1")).toBe(true);
      expect(result.has("2")).toBe(false);
      expect(result.has("3")).toBe(false);
    });

    it("should find groups by brand", () => {
      const result = findGroups(groupMap, "tropicana");
      expect(result.size).toBe(1);
      expect(result.has("1")).toBe(true);
      expect(result.has("2")).toBe(false);
      expect(result.has("3")).toBe(false);
    });

    it("should find groups by name and brand", () => {
      const result = findGroups(groupMap, "orange juice tropicana");
      expect(result.size).toBe(1);
      expect(result.has("1")).toBe(true);
      expect(result.has("2")).toBe(false);
      expect(result.has("3")).toBe(false);
    });

    it("should return all groups for empty search query", () => {
      const result = findGroups(groupMap, "");
      expect(result.size).toBe(3);
      expect(result.has("1")).toBe(true);
      expect(result.has("2")).toBe(true);
      expect(result.has("3")).toBe(true);
    });

    it("should return empty map for non-matching query", () => {
      const result = findGroups(groupMap, "banana");
      expect(result.size).toBe(0);
      expect(result).toBeInstanceOf(Map);
    });

    it("should match groups with missing brand", () => {
      groupMap.set("4", {
        name: "bok choy",
        brand: null,
        store: "Superstore",
        count: 1,
        amount: 300,
        unit: "g" as const,
        minPrice: 0.99,
        maxPrice: 1.29,
        pricePoints: [
          { id: "1", date: new Date("2024-09-15"), price: 0.99, isSale: false },
          { id: "2", date: new Date("2024-08-15"), price: 1.29, isSale: true },
        ],
      });
      const result = findGroups(groupMap, "choy");
      expect(result.size).toBe(1);
      expect(result.has("1")).toBe(false);
      expect(result.has("2")).toBe(false);
      expect(result.has("3")).toBe(false);
      expect(result.has("4")).toBe(true);
    });

    it("should find multiple groups", () => {
      const result = findGroups(groupMap, "orange");
      expect(result.size).toBe(2);
      expect(result.has("1")).toBe(true);
      expect(result.has("2")).toBe(false);
      expect(result.has("3")).toBe(true);
    });

    it("should return empty map if grocery list is empty", () => {
      const emptyMap: GroupMap = new Map();

      const result = findGroups(emptyMap, "orange");
      expect(result.size).toBe(0);
    });

    it("should include duplicates when name and brand match", () => {
      groupMap.set("4", {
        name: "orange juice",
        brand: "Tropicana",
        store: "Superstore",
        count: 1,
        amount: 100,
        unit: "mL" as const,
        minPrice: 3.99,
        maxPrice: 4.29,
        pricePoints: [
          { id: "1", date: new Date("2024-09-15"), price: 4.29, isSale: false },
          { id: "2", date: new Date("2024-08-15"), price: 3.99, isSale: true },
        ],
      });

      const result = findGroups(groupMap, "orange tropicana");
      expect(result.size).toBe(2);
      expect(result.has("1")).toBe(true);
      expect(result.has("2")).toBe(false);
      expect(result.has("3")).toBe(false);
      expect(result.has("4")).toBe(true);
    });
  });

  describe("sortGroups", () => {
    it("should sort groups by converted price correctly", () => {
      const groups = [
        {
          id: "1",
          count: 1,
          amount: 100,
          unit: "mL",
          minPrice: 4.0,
        },
        {
          id: "2",
          count: 1,
          amount: 200,
          unit: "mL",
          minPrice: 5.0,
        },
      ] as GroceryGroup[];

      const result = sortGroups(groups, "cheapest");
      expect(result).toEqual([groups[1], groups[0]]);
    });

    it("should sort multiple items by date correctly", () => {
      const items = [
        { id: "1", date: new Date("2024-01-01") },
        { id: "2", date: new Date("1999-02-01") },
        { id: "3", date: new Date("2024-01-10") },
        { id: "4", date: new Date("2023-01-01") },
        { id: "5", date: new Date("2022-07-23") },
      ] as GroceryItem[];

      const groups = [
        {
          id: "1",
          priceHistory: [
            { date: new Date("2023-01-10") },
            { date: new Date("2024-02-14") },
            { date: new Date("2024-01-20") },
          ],
        },
        {
          id: "2",
          priceHistory: [{ date: new Date("2024-09-15") }],
        },
        {
          id: "3",
          priceHistory: [
            { date: new Date("2025-01-15") },
            { date: new Date("2025-02-15") },
          ],
        },
        {
          id: "4",
          priceHistory: [
            { date: new Date("2023-01-12") },
            { date: new Date("2023-04-15") },
            { date: new Date("2024-05-15") },
            { date: new Date("2024-06-18") },
          ],
        },
      ] as GroceryGroup[];

      const result = sortGroups(groups, "newest");
      expect(result).toEqual([groups[2], groups[1], groups[3], groups[0]]);
    });

    it("should handle single group", () => {
      const groups = [
        {
          id: "1",
          priceHistory: [
            { date: new Date("2023-01-10") },
            { date: new Date("2024-02-14") },
          ],
        },
      ] as GroceryGroup[];

      const result = sortGroups(groups, "newest");
      expect(result).toEqual([groups[0]]);
    });

    it("should handle empty array", () => {
      const result = sortGroups([], "newest");
      expect(result).toStrictEqual([]);
    });

    it("should maintain original array immutability", () => {
      const original = [
        {
          count: 1,
          amount: 100,
          unit: "mL",
          minPrice: 4.0,
        },
        {
          count: 1,
          amount: 1,
          unit: "L",
          minPrice: 5.0,
        },
      ] as GroceryGroup[];
      const originalCopy = [...original];

      sortGroups(original, "cheapest");
      expect(original).toEqual(originalCopy);
    });
  });

  describe("groupMapToArray", () => {
    it("should convert a GroupMap to an array of GroceryGroups", () => {
      const groupMap: GroupMap = new Map();

      groupMap.set("group1", {
        name: "orange juice",
        brand: "Tropicana",
        store: "Walmart",
        count: 1,
        amount: 100,
        unit: "mL",
        minPrice: 3.99,
        maxPrice: 4.29,
        pricePoints: [
          { id: "1", date: new Date("2024-09-15"), price: 4.29, isSale: false },
          { id: "2", date: new Date("2024-08-15"), price: 3.99, isSale: true },
        ],
      });

      groupMap.set("group2", {
        name: "apple",
        brand: null,
        store: "Costco",
        count: 5,
        amount: 1,
        unit: "kg",
        minPrice: 2.99,
        maxPrice: 3.49,
        pricePoints: [
          { id: "3", date: new Date("2024-09-10"), price: 3.49, isSale: false },
        ],
      });

      const result = groupMapToArray(groupMap);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);

      expect(result[0].id).toBe("group1");
      expect(result[1].id).toBe("group2");

      expect(result[0].name).toBe("orange juice");
      expect(result[0].brand).toBe("Tropicana");
      expect(result[1].name).toBe("apple");
      expect(result[1].brand).toBeNull();

      expect(result[0].priceHistory.length).toBe(2);
      expect(result[1].priceHistory.length).toBe(1);
    });

    it("should handle empty Map", () => {
      const groupMap: GroupMap = new Map();
      const result = groupMapToArray(groupMap);

      expect(result).toEqual([]);
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
      const result = getFilteredItemsWithView([baseItem], "", "newest", "list");
      expect(result.view).toBe("LIST");
    });

    it("should return correct view type for group view", () => {
      const result = getFilteredItemsWithView(
        [baseItem],
        "",
        "newest",
        "group"
      );
      expect(result.view).toBe("GROUP");
    });

    it("should include groupMap in the response for list view", () => {
      const result = getFilteredItemsWithView([baseItem], "", "newest", "list");
      expect(result.groupMap).toBeDefined();
      expect(result.groupMap).toBeInstanceOf(Map);
      expect(result.groupMap.size).toBe(1);
      expect(result.groupMap.has("1")).toBe(true);
    });

    it("should include groupMap in the response for group view", () => {
      const result = getFilteredItemsWithView(
        [baseItem],
        "",
        "newest",
        "group"
      );
      expect(result.groupMap).toBeDefined();
      expect(result.groupMap).toBeInstanceOf(Map);
      expect(result.groupMap.size).toBe(1);
      expect(result.groupMap.has("1")).toBe(true);
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
        const result = getFilteredItemsWithView(items, "", "cheapest", "group");
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
        const result = getFilteredItemsWithView(items, "", "newest", "group");

        expect(result.view).toBe("GROUP");
        expect(result.items).toHaveLength(4);
        expect(result.items[0].id).toBe("4");
        expect(result.items[1].id).toBe("2");
        expect(result.items[2].id).toBe("3");
        expect(result.items[3].id).toBe("1");
      });
    });

    describe("search, sort and group", () => {
      const items = [
        {
          ...baseItem,
          name: "orange juice",
          price: 3.99,
          date: new Date("2024-03-01"),
          groupId: "1",
        },
        {
          ...baseItem,
          name: "orange soda",
          price: 2.99,
          date: new Date("2024-01-01"),
          groupId: "2",
        },
        {
          ...baseItem,
          name: "apple juice",
          price: 1.99,
          date: new Date("2024-02-01"),
          groupId: "3",
        },
      ];

      it("should filter and sort by price in list view", () => {
        const result = getFilteredItemsWithView(
          items,
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
        const result = getFilteredItemsWithView([], "apple", "newest", "list");
        expect(result.items).toHaveLength(0);
      });

      it("should return all items when no search query", () => {
        const result = getFilteredItemsWithView(
          [baseItem],
          "",
          "newest",
          "list"
        );
        expect(result.items).toHaveLength(1);
      });

      it("should handle no search results", () => {
        const result = getFilteredItemsWithView(
          [baseItem],
          "nonexistent",
          "newest",
          "list"
        );
        expect(result.items).toHaveLength(0);
      });
    });
  });
});
