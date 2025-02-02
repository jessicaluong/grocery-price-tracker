import { matchName } from "@/lib/utils";
import {
  GroceryItem,
  GroupedGroceryItem,
  ItemsWithViewMode,
  SortOptions,
  ViewOptions,
} from "@/lib/types";
import { VIEW_OPTIONS } from "@/lib/constants";

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

export const formatString = (str: string | null): string => {
  if (!str) return "";
  return str.replace(/\s/g, "").trim().toLowerCase();
};

export const getGroupKey = (item: GroceryItem): string => {
  return `${formatString(item.name)}-${formatString(item.brand)}-${formatString(
    item.store
  )}-${item.count}-${item.amount}-${formatString(item.unit)}`;
};

export const groupItems = (items: GroceryItem[]): GroupedGroceryItem[] => {
  type GroupAccumulator = {
    items: GroceryItem[];
    minPrice: number;
    maxPrice: number;
  };

  let groupMap = new Map<string, GroupAccumulator>();

  items.forEach((item) => {
    const key = getGroupKey(item);
    if (groupMap.has(key)) {
      const group = groupMap.get(key)!;
      group.items.push(item);
      group.minPrice = Math.min(group.minPrice, item.price);
      group.maxPrice = Math.max(group.maxPrice, item.price);
    } else {
      groupMap.set(key, {
        items: [item],
        minPrice: item.price,
        maxPrice: item.price,
      });
    }
  });

  const groups: GroupedGroceryItem[] = [];
  groupMap.forEach((group, key) => {
    groups.push({
      id: key,
      name: group.items[0].name,
      brand: group.items[0].brand,
      store: group.items[0].store,
      count: group.items[0].count,
      amount: group.items[0].amount,
      unit: group.items[0].unit,
      priceRange: { min: group.minPrice, max: group.maxPrice },
      numberOfItems: group.items.length,
    });
  });

  return groups;
};

export const getFilteredItemsWithView = (
  initialItems: GroceryItem[],
  searchQuery: string,
  sortBy: SortOptions,
  viewMode: ViewOptions
): ItemsWithViewMode => {
  const foundItems = findItems(initialItems, searchQuery);
  const sortedItems = sortItems(foundItems, sortBy);

  if (viewMode === VIEW_OPTIONS.GROUP) {
    return {
      view: "GROUP",
      items: groupItems(sortedItems),
    };
  }

  return {
    view: "LIST",
    items: sortedItems,
  };
};
