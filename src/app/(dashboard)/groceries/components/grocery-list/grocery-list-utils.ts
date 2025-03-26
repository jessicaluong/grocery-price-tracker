import { getConvertedPrice, matchName } from "@/lib/utils";
import {
  GroceryItem,
  ItemsWithViewMode,
  GroupMap,
  SortParamValues,
  ViewParamValues,
  GroceryGroup,
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

export function findByNameAndBrand<
  T extends { name: string; brand: string | null }
>(items: T[], query: string): T[] {
  if (!query) return items;

  return items.filter((item) => {
    const combinedText = `${item.name} ${item.brand || ""}`;
    return matchName(combinedText, query);
  });
}

export const findItems = (
  items: GroceryItem[],
  query: string
): GroceryItem[] => {
  return findByNameAndBrand(items, query);
};

export const findGroups = (
  groups: GroceryGroup[],
  query: string
): GroceryGroup[] => {
  return findByNameAndBrand(groups, query);
};

export const sortGroups = (
  groups: GroceryGroup[],
  sortOrder: SortParamValues
): GroceryGroup[] => {
  return [...groups].sort((a, b) => {
    const aEmpty = !a.itemCount || a.itemCount === BigInt(0);
    const bEmpty = !b.itemCount || b.itemCount === BigInt(0);

    // If one is empty and the other isn't, put empty one at the end
    if (aEmpty && !bEmpty) return 1;
    if (!aEmpty && bEmpty) return -1;
    // If both empty, keep original order
    if (aEmpty && bEmpty) return 0;

    switch (sortOrder) {
      case "cheapest":
        const priceA = getConvertedPrice(
          a.count,
          a.minPrice!,
          a.amount,
          a.unit
        );
        const priceB = getConvertedPrice(
          b.count,
          b.minPrice!,
          b.amount,
          b.unit
        );
        return compareNumbersAscending(priceA, priceB);
      case "newest":
        return compareDatesDescending(
          { date: a.newestDate! },
          { date: b.newestDate! }
        );
    }
  });
};

export const createGroupMap = (groups: GroceryGroup[]): GroupMap => {
  let groupMap: GroupMap = new Map();

  groups.forEach((group) => {
    groupMap.set(group.id, { ...group, itemCount: Number(group.itemCount) });
  });
  return groupMap;
};

export const getFilteredItemsWithView = (
  items: GroceryItem[],
  groups: GroceryGroup[],
  searchQuery: string,
  sortBy: SortParamValues,
  viewMode: ViewParamValues
): ItemsWithViewMode => {
  const GroupMap = createGroupMap(groups);

  if (viewMode === VIEW_OPTIONS.GROUP.param) {
    const foundGroups = findGroups(groups, searchQuery);
    const sortedGroups = sortGroups(foundGroups, sortBy);

    return {
      view: "GROUP",
      items: sortedGroups,
      groupMap: GroupMap,
    };
  }

  const foundItems = findItems(items, searchQuery);
  const sortedItems = sortItems(foundItems, sortBy);

  return {
    view: "LIST",
    items: sortedItems,
    groupMap: GroupMap,
  };
};
