import { getConvertedPrice, matchName } from "@/lib/utils";
import {
  GroceryItem,
  GroceryGroup,
  ItemsWithViewMode,
  SortDisplayValues,
  ViewDisplayValues,
  PricePoint,
  Unit,
  GroupMap,
} from "@/lib/types";
import { VIEW_OPTIONS } from "@/lib/constants";

export const compareNumbersAscending = (a: number, b: number): number => a - b;

export const compareDatesDescending = <T extends { date: Date }>(
  a: T,
  b: T
): number => new Date(b.date).getTime() - new Date(a.date).getTime();

export const sortItems = <
  T extends {
    count: number;
    amount: number;
    unit: Unit;
    price: number;
    date: Date;
  }
>(
  items: T[],
  sortOrder: SortDisplayValues
): T[] => {
  return [...items].sort((a, b) => {
    switch (sortOrder) {
      case "Lowest Price":
        const priceA = getConvertedPrice(a.count, a.price, a.amount, a.unit);
        const priceB = getConvertedPrice(b.count, b.price, b.amount, b.unit);
        return compareNumbersAscending(priceA, priceB);
      case "Newest Date":
        return compareDatesDescending(a, b);
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

export const getGroupMap = (items: GroceryItem[]) => {
  type Group = {
    name: string;
    brand: string | null;
    store: string;
    count: number;
    amount: number;
    unit: Unit;
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
      name: item.name,
      brand: item.brand,
      store: item.store,
      count: item.count,
      amount: item.amount,
      unit: item.unit,
      minPrice: item.price,
      maxPrice: item.price,
      pricePoints: [pricePoint],
    };
  };

  const updateExistingGroup = (group: Group, item: GroceryItem): void => {
    group.minPrice = Math.min(group.minPrice, item.price);
    group.maxPrice = Math.max(group.maxPrice, item.price);
    group.pricePoints.push({
      date: item.date,
      price: item.price,
      isSale: item.isSale,
    });
  };

  items.forEach((item) => {
    groupMap.has(item.groupId)
      ? updateExistingGroup(groupMap.get(item.groupId)!, item)
      : groupMap.set(item.groupId, createInitialGroup(item));
  });

  return groupMap;
};

export const groupItems = (items: GroceryItem[]): GroceryGroup[] => {
  // access group map here
  type Group = {
    item: GroceryItem; // One representative item for group name, brand, store, count, amount, unit
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
      item: item,
      minPrice: item.price,
      maxPrice: item.price,
      pricePoints: [pricePoint],
    };
  };

  const updateExistingGroup = (group: Group, item: GroceryItem): void => {
    group.minPrice = Math.min(group.minPrice, item.price);
    group.maxPrice = Math.max(group.maxPrice, item.price);
    group.pricePoints.push({
      date: item.date,
      price: item.price,
      isSale: item.isSale,
    });
  };

  items.forEach((item) => {
    groupMap.has(item.groupId)
      ? updateExistingGroup(groupMap.get(item.groupId)!, item)
      : groupMap.set(item.groupId, createInitialGroup(item));
  });

  const groups: GroceryGroup[] = [];

  groupMap.forEach((group) => {
    groups.push({
      id: group.item.groupId,
      name: group.item.name,
      brand: group.item.brand,
      store: group.item.store,
      count: group.item.count,
      amount: group.item.amount,
      unit: group.item.unit,
      minPrice: group.minPrice,
      maxPrice: group.maxPrice,
      priceHistory: group.pricePoints.sort((a, b) =>
        compareDatesDescending(a, b)
      ),
    });
  });

  return groups;
};

const findGroups = () => {};

const sortGroups = () => {};

export const getFilteredItemsWithView = (
  items: GroceryItem[],
  searchQuery: string,
  sortBy: SortDisplayValues,
  viewMode: ViewDisplayValues
): ItemsWithViewMode => {
  const foundItems = findItems(items, searchQuery);
  const sortedItems = sortItems(foundItems, sortBy);

  if (viewMode === VIEW_OPTIONS.GROUP.display) {
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
