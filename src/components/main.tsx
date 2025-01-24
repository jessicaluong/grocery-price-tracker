"use client";

import Header from "@/components/header/header";
import GroceryList from "@/components/grocery-list/grocery-list";
import { GroceryItem, SortOptions, ViewOptions } from "@/lib/types";
import { useMemo, useState } from "react";
import { DEFAULT_SORT, DEFAULT_VIEW, VIEW_OPTIONS } from "@/lib/constants";
import { findItems, sortItems, groupItems } from "@/services/grocery-service";

type MainProps = { initialItems: GroceryItem[] };

export default function Main({ initialItems }: MainProps) {
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

  // if (!initialItems || initialItems.length === 0) {
  //   return <div>No grocery items available.</div>;
  // }

  const filteredItems: GroceryItem[] = useMemo(() => {
    const foundItems = findItems(initialItems, searchQuery);
    const sortedItems = sortItems(foundItems, sortBy);

    if (viewMode === VIEW_OPTIONS.GROUP) {
      return groupItems(sortedItems, sortBy);
    }

    return sortedItems;
  }, [initialItems, searchQuery, sortBy]);

  return (
    <main className="flex justify-center w-full p-[10px]">
      <div className="flex w-full max-w-[1200px] sm:border rounded-xl">
        <div className="hidden sm:block border-r"></div>
        <div className="flex-1 min-w-0  p-[10px]">
          <Header
            onSetSearchQuery={handleSetSearchQuery}
            sortBy={sortBy}
            viewMode={viewMode}
            onSetSortBy={handleSetSortBy}
            onSetViewMode={handleSetViewMode}
          />
          <GroceryList filteredItems={filteredItems} />
        </div>
      </div>
    </main>
  );
}
