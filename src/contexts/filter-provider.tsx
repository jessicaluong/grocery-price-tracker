"use client";

import { DEFAULT_SORT, DEFAULT_VIEW } from "@/lib/constants";
import { useGrocery } from "@/lib/hooks";
import { GroceryItem, SortOptions, ViewOptions } from "@/lib/types";
import { createContext, useState } from "react";

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
    console.log(`Query changed to: ${query}`);
    // TODO: escape key should remove query
  };

  const handleSetSortBy = (mode: SortOptions) => {
    setSortBy(mode);
    console.log(`Sort changed to: ${mode}`);
  };

  const handleSetViewMode = (mode: ViewOptions) => {
    setViewMode(mode);
    console.log(`View changed to: ${mode}`);
  };

  const filteredItems = groceryItems.filter((item) => {
    const itemNameMatch = matchItemName(item.name, searchQuery);
    const brandNameMatch =
      item.brand && matchBrandName(item.brand, searchQuery);

    return itemNameMatch || brandNameMatch;
  });

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
