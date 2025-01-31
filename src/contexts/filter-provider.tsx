"use client";

import { DEFAULT_SORT, DEFAULT_VIEW, VIEW_OPTIONS } from "@/lib/constants";
import {
  GroceryItem,
  ItemsWithViewMode,
  SortOptions,
  ViewOptions,
} from "@/lib/types";
import { findItems, groupItems, sortItems } from "@/services/grocery-service";
import { createContext, useMemo, useState } from "react";

type FilterContextType = {
  searchQuery: string;
  sortBy: SortOptions;
  viewMode: ViewOptions;
  handleSetSearchQuery: (query: string) => void;
  handleSetSortBy: (mode: SortOptions) => void;
  handleSetViewMode: (mode: ViewOptions) => void;
  filteredItemsWithView: ItemsWithViewMode;
};

export const FilterContext = createContext<FilterContextType | null>(null);

type FilterProviderProps = {
  children: React.ReactNode;
  initialItems: GroceryItem[];
};

export default function FilterProvider({
  children,
  initialItems,
}: FilterProviderProps) {
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

  const filteredItemsWithView: ItemsWithViewMode = useMemo(() => {
    const foundItems = findItems(initialItems, searchQuery);
    const sortedItems = sortItems(foundItems, sortBy);

    if (viewMode === VIEW_OPTIONS.GROUP) {
      return {
        view: "GROUP",
        items: groupItems(sortedItems),
      };
    }

    // TODO: rearrange view and sorted (e.g., sort the grouped?)
    // maybe not sort grouped items
    return {
      view: "LIST",
      items: sortedItems,
    };
  }, [initialItems, searchQuery, sortBy, viewMode]);

  return (
    <FilterContext.Provider
      value={{
        searchQuery,
        sortBy,
        viewMode,
        handleSetSearchQuery,
        handleSetSortBy,
        handleSetViewMode,
        filteredItemsWithView,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}
