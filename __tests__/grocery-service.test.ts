import {
  findItems,
  sortByPrice,
  sortByDate,
  sortItems,
} from "@/services/grocery-service";
import { GroceryItem } from "@/lib/types";

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
    expect(result).toEqual([items[1], items[2], items[4], items[3], items[0]]);
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
    expect(result).toEqual([items[2], items[0], items[3], items[4], items[1]]);
  });

  it("should handle single item", () => {
    const items = [{ id: "1", date: new Date("2024-01-01") }] as GroceryItem[];

    const result = sortItems(items, "Recently Added");
    expect(result).toEqual([items[0]]);
  });

  it("should handle empty array", () => {
    const result = sortItems([], "Recently Added");
    expect(result).toEqual([]);
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
