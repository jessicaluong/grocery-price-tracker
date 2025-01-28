import { matchName } from "@/lib/utils";
import {
  GroceryItem,
  GroupedGroceryItem,
  SortOptions,
  Unit,
} from "@/lib/types";

export const sortByPrice = (a: GroceryItem, b: GroceryItem) =>
  a.price - b.price;

export const sortByDate = (a: GroceryItem, b: GroceryItem) =>
  new Date(b.date).getTime() - new Date(a.date).getTime();

export const sortItems = (
  items: GroceryItem[],
  sortOrder: SortOptions
): GroceryItem[] => {
  return [...items].sort((a, b) => {
    switch (sortOrder) {
      case "Lowest Price":
        return sortByPrice(a, b);
      case "Recently Added":
        return sortByDate(a, b);
    }
  });
};

export const findItems = (
  items: GroceryItem[],
  query: string
): GroceryItem[] => {
  if (!query) return items;

  return items.filter((item) => {
    const combinedText = `${item.name} ${item.brand || ""}`;
    return matchName(combinedText, query);
  });
};

export const groupItems = (
  items: GroceryItem[],
  sortOrder: SortOptions
): GroupedGroceryItem[] => {
  // TODO: group items that have the same name, quantity, unit, amount, and store, count???
  const testItem = {
    id: "1",
    name: "oats",
    brand: "Quaker",
    store: "Superstore",
    count: 1,
    amount: 1,
    unit: "kg" as Unit,
    priceRange: {
      min: 1,
      max: 2,
    },
  };
  return [testItem];
};
