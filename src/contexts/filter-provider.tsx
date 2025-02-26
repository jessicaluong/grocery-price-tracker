"use client";

import { DEFAULT_SORT, DEFAULT_VIEW } from "@/lib/constants";
import {
  GroceryItem,
  ItemsWithViewMode,
  SortDisplayValues,
  ViewDisplayValues,
} from "@/lib/types";
import { getFilteredItemsWithView } from "@/contexts/filter-utils";
import { createContext, useMemo, useState } from "react";

type FilterContextType = {
  searchQuery: string;
  sortBy: SortDisplayValues;
  viewMode: ViewDisplayValues;
  handleSetSearchQuery: (query: string) => void;
  handleSetSortBy: (mode: SortDisplayValues) => void;
  handleSetViewMode: (mode: ViewDisplayValues) => void;
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
  const [sortBy, setSortBy] = useState<SortDisplayValues>(DEFAULT_SORT.display);
  const [viewMode, setViewMode] = useState<ViewDisplayValues>(
    DEFAULT_VIEW.display
  );

  const handleSetSearchQuery = (query: string) => {
    setSearchQuery(query);
  };

  const handleSetSortBy = (mode: SortDisplayValues) => {
    setSortBy(mode);
  };

  const handleSetViewMode = (mode: ViewDisplayValues) => {
    setViewMode(mode);
  };

  // const groupMap = useMemo(() => getGroupMap(initialItems), [initialItems]);

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
