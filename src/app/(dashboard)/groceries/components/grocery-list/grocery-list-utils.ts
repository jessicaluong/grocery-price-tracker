import { getConvertedPrice, matchName } from "@/lib/utils";
import {
  GroceryItem,
  GroceryGroup,
  ItemsWithViewMode,
  GroupMap,
  SortParamValues,
  ViewParamValues,
} from "@/types/grocery";
import { VIEW_OPTIONS } from "@/lib/constants";

export const compareNumbersAscending = (a: number, b: number): number => a - b;

export const compareDatesDescending = <T extends { date: Date }>(
  a: T,
  b: T
): number => new Date(b.date).getTime() - new Date(a.date).getTime();

export const compareDatesAscending = <T extends { date: Date }>(
  a: T,
  b: T
): number => new Date(a.date).getTime() - new Date(b.date).getTime();

export const sortItems = (
  items: GroceryItem[],
  sortOrder: SortParamValues
): GroceryItem[] => {
  return [...items].sort((a, b) => {
    switch (sortOrder) {
      case "cheapest":
        const priceA = getConvertedPrice(a.count, a.price, a.amount, a.unit);
        const priceB = getConvertedPrice(b.count, b.price, b.amount, b.unit);
        return compareNumbersAscending(priceA, priceB);
      case "newest":
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

export const createGroupMap = (items: GroceryItem[]): GroupMap => {
  let groupMap: GroupMap = new Map();

  const createInitialGroup = (item: GroceryItem): void => {
    const pricePoint = {
      id: item.id,
      date: item.date,
      price: item.price,
      isSale: item.isSale,
    };
    const group = {
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

    groupMap.set(item.groupId, group);
  };

  const updateExistingGroup = (item: GroceryItem): void => {
    const group = groupMap.get(item.groupId)!;
    group.minPrice = Math.min(group.minPrice, item.price);
    group.maxPrice = Math.max(group.maxPrice, item.price);
    group.pricePoints.push({
      id: item.id,
      date: item.date,
      price: item.price,
      isSale: item.isSale,
    });
  };

  items.forEach((item) => {
    groupMap.has(item.groupId)
      ? updateExistingGroup(item)
      : createInitialGroup(item);
  });

  groupMap.forEach((group) => {
    group.pricePoints.sort(compareDatesAscending);
  });

  return groupMap;
};

export const findGroups = (groupMap: GroupMap, query: string): GroupMap => {
  if (!query) return groupMap;

  const filteredMap: GroupMap = new Map();

  groupMap.forEach((groupData, groupId) => {
    const combinedText = `${groupData.name} ${groupData.brand || ""}`;
    if (matchName(combinedText, query)) {
      filteredMap.set(groupId, groupData);
    }
  });

  return filteredMap;
};

export const sortGroups = (
  groups: GroceryGroup[],
  sortOrder: SortParamValues
): GroceryGroup[] => {
  return [...groups].sort((a, b) => {
    switch (sortOrder) {
      case "cheapest":
        const priceA = getConvertedPrice(a.count, a.minPrice, a.amount, a.unit);
        const priceB = getConvertedPrice(b.count, b.minPrice, b.amount, b.unit);
        return compareNumbersAscending(priceA, priceB);
      case "newest":
        return compareDatesDescending(
          a.priceHistory[a.priceHistory.length - 1],
          b.priceHistory[b.priceHistory.length - 1]
        );
    }
  });
};

export const groupMapToArray = (groupMap: GroupMap): GroceryGroup[] => {
  const groups: GroceryGroup[] = [];

  groupMap.forEach((groupData, groupId) => {
    groups.push({
      id: groupId,
      name: groupData.name,
      brand: groupData.brand,
      store: groupData.store,
      count: groupData.count,
      amount: groupData.amount,
      unit: groupData.unit,
      minPrice: groupData.minPrice,
      maxPrice: groupData.maxPrice,
      priceHistory: groupData.pricePoints,
    });
  });

  return groups;
};

export const getFilteredItemsWithView = (
  items: GroceryItem[],
  searchQuery: string,
  sortBy: SortParamValues,
  viewMode: ViewParamValues
): ItemsWithViewMode => {
  const groupMap = createGroupMap(items);

  if (viewMode === VIEW_OPTIONS.GROUP.param) {
    const foundGroups = findGroups(groupMap, searchQuery);
    const sortedGroups = sortGroups(groupMapToArray(foundGroups), sortBy);
    return {
      view: "GROUP",
      items: sortedGroups,
      groupMap: groupMap,
    };
  }

  const foundItems = findItems(items, searchQuery);
  const sortedItems = sortItems(foundItems, sortBy);

  return {
    view: "LIST",
    items: sortedItems,
    groupMap: groupMap,
  };
};
