"use client";

import { DEFAULT_SORT, DEFAULT_VIEW } from "@/lib/constants";
import {
  GroceryItem,
  ItemsWithViewMode,
  SortOptions,
  ViewOptions,
} from "@/lib/types";
import { getFilteredItemsWithView } from "@/contexts/filter-utils";
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

  const filteredItemsWithView: ItemsWithViewMode = useMemo(
    () => getFilteredItemsWithView(initialItems, searchQuery, sortBy, viewMode),
    [initialItems, searchQuery, sortBy, viewMode]
  );

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
