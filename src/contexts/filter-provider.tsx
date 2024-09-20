"use client";

import { DEFAULT_SORT, DEFAULT_VIEW } from "@/lib/constants";
import { useGrocery } from "@/lib/hooks";
import { GroceryItem, SortOptions, ViewOptions } from "@/lib/types";
import { createContext, useMemo, useState } from "react";

type FilterContextType = {
  searchQuery: string;
  sortBy: SortOptions;
  viewMode: ViewOptions;
  handleSetSearchQuery: (query: string) => void;
  handleSetSortBy: (mode: SortOptions) => void;
  handleSetViewMode: (mode: ViewOptions) => void;
  filteredItems: GroceryItem[];
};

export const FilterContext = createContext<FilterContextType | null>(null);

function matchItemName(itemName: string, searchQuery: string) {
  const words = itemName.toLowerCase().split(/\s+/);
  const searchWords = searchQuery.toLowerCase().split(/\s+/);

  return searchWords.every((searchWord) =>
    words.some((word) => word.startsWith(searchWord))
  );
}

function matchBrandName(brandName: string, searchQuery: string) {
  return brandName.toLowerCase().startsWith(searchQuery.toLowerCase());
}

type FilterProviderProps = {
  children: React.ReactNode;
};

export default function FilterProvider({ children }: FilterProviderProps) {
  const { groceryItems } = useGrocery();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOptions>(DEFAULT_SORT);
  const [viewMode, setViewMode] = useState<ViewOptions>(DEFAULT_VIEW);

  const handleSetSearchQuery = (query: string) => {
    setSearchQuery(query);
  };

  const handleSetSortBy = (mode: SortOptions) => {
    setSortBy(mode);
  };

  const handleSetViewMode = (mode: ViewOptions) => {
    setViewMode(mode);
  };

  const sortItems = (
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

  const findItems = (items: GroceryItem[], query: string): GroceryItem[] => {
    return items.filter((item) => {
      const itemNameMatch = matchItemName(item.name, query);
      const brandNameMatch = item.brand && matchBrandName(item.brand, query);
      return itemNameMatch || brandNameMatch;
    });
  };

  const groupItems = (items: GroceryItem[], sortOrder: SortOptions) => {
    // TODO:
    return items;
  };

  const filteredItems: GroceryItem[] = useMemo(() => {
    const foundItems = findItems(groceryItems, searchQuery);
    const sortedItems = sortItems(foundItems, sortBy);

    if (viewMode === "Group by Item") {
      return groupItems(sortedItems, sortBy);
    }

    return sortedItems;
  }, [groceryItems, searchQuery, sortBy]);

  return (
    <FilterContext.Provider
      value={{
        searchQuery,
        sortBy,
        viewMode,
        handleSetSearchQuery,
        handleSetSortBy,
        handleSetViewMode,
        filteredItems,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}
