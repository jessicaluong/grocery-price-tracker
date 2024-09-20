"use client";

import { DEFAULT_SORT, DEFAULT_VIEW } from "@/lib/constants";
import { SortOptions, ViewOptions } from "@/lib/types";
import { createContext, useState } from "react";

type FilterContextType = {
  searchQuery: string;
  handleSetSearchQuery: (query: string) => void;
  sortBy: SortOptions;
  viewMode: ViewOptions;
  handleSetSortBy: (mode: SortOptions) => void;
  handleSetViewMode: (mode: ViewOptions) => void;
};

export const FilterContext = createContext<FilterContextType | null>(null);

type FilterProviderProps = {
  children: React.ReactNode;
};

export default function FilterProvider({ children }: FilterProviderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOptions>(DEFAULT_SORT);
  const [viewMode, setViewMode] = useState<ViewOptions>(DEFAULT_VIEW);

  const handleSetSearchQuery = (query: string) => {
    setSearchQuery(query);
    // console.log(searchQuery);

    // escape should remove query
  };

  const handleSetSortBy = (mode: SortOptions) => {
    setSortBy(mode);
    console.log(`Sort changed to: ${mode}`);
  };

  const handleSetViewMode = (mode: ViewOptions) => {
    setViewMode(mode);
    console.log(`View changed to: ${mode}`);
  };

  return (
    <FilterContext.Provider
      value={{
        searchQuery,
        handleSetSearchQuery,
        sortBy,
        viewMode,
        handleSetSortBy,
        handleSetViewMode,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}
