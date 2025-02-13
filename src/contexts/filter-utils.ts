import { matchName } from "@/lib/utils";
import {
  GroceryItem,
  GroupedGroceryItem,
  ItemsWithViewMode,
  PricePoint,
  SortOptions,
  ViewOptions,
} from "@/lib/types";
import { VIEW_OPTIONS } from "@/lib/constants";

export const sortByPrice = (a: GroceryItem, b: GroceryItem): number =>
  a.price - b.price;

export const sortByDate = <T extends { date: Date }>(a: T, b: T): number =>
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
  type Group = {
    items: GroceryItem[];
    minPrice: number;
    maxPrice: number;
    pricePoints: PricePoint[];
  };

  let groupMap = new Map<string, Group>();

  const createInitialGroup = (item: GroceryItem): Group => {
    const pricePoint = {
      date: item.date,
      price: item.price,
      isSale: item.isSale,
    };
    return {
      items: [item],
      minPrice: item.price,
      maxPrice: item.price,
      pricePoints: [pricePoint],
    };
  };

  const updateExistingGroup = (group: Group, item: GroceryItem): void => {
    group.items.push(item);
    group.minPrice = Math.min(group.minPrice, item.price);
    group.maxPrice = Math.max(group.maxPrice, item.price);
    group.pricePoints.push({
      date: item.date,
      price: item.price,
      isSale: item.isSale,
    });
  };

  items.forEach((item) => {
    const key = getGroupKey(item);
    groupMap.has(key)
      ? updateExistingGroup(groupMap.get(key)!, item)
      : groupMap.set(key, createInitialGroup(item));
  });

  const groups: GroupedGroceryItem[] = [];

  groupMap.forEach((group, key) => {
    const firstItem = group.items[0];
    groups.push({
      id: key,
      name: firstItem.name,
      brand: firstItem.brand,
      store: firstItem.store,
      count: firstItem.count,
      amount: firstItem.amount,
      unit: firstItem.unit,
      numberOfItems: group.items.length,
      priceRange: { min: group.minPrice, max: group.maxPrice },
      priceHistory: group.pricePoints.sort((a, b) => sortByDate(a, b)),
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
