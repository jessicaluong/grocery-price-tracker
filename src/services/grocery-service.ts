import { matchName } from "@/lib/utils";
import { GroceryItem, SortOptions } from "@/lib/types";

export const sortByPrice = (a: GroceryItem, b: GroceryItem) =>
  a.price - b.price;

export const sortByDate = (a: GroceryItem, b: GroceryItem) =>
  new Date(b.date).getTime() - new Date(a.date).getTime();

export const sortItems = (
  items: GroceryItem[],
  sortOrder: SortOptions
): GroceryItem[] => {
  if (sortOrder !== "Lowest Price" && sortOrder !== "Recently Added") {
    throw new Error(`Invalid sort order: ${sortOrder}`);
  }

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

export const groupItems = (items: GroceryItem[], sortOrder: SortOptions) => {
  // TODO: group items that have the same name, quantity, unit, amount, and store
  return items;
};
