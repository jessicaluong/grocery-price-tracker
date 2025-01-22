import { matchName } from "@/lib/utils";
import { GroceryItem, SortOptions } from "@/lib/types";

export const sortItems = (
  items: GroceryItem[],
  sortOrder: SortOptions
): GroceryItem[] => {
  return [...items].sort((a, b) => {
    if (sortOrder === "Lowest Price") {
      return a.price - b.price;
    } else if (sortOrder === "Recently Added") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return 0;
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
  // TODO: group items that have the same name, quantity and store
  return items;
};
