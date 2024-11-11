"use client";

import Header from "@/components/header/header";
import Sidebar from "@/components/sidebar";
import GroceryList from "@/components/grocery-list/grocery-list";
import { GroceryItem, SortOptions, ViewOptions } from "@/lib/types";
import { useMemo, useState } from "react";
import { DEFAULT_SORT, DEFAULT_VIEW } from "@/lib/constants";
import { matchBrandName, matchItemName } from "@/lib/utils";

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
    // TODO: group items that have the same name, quantity and store
    return items;
  };

  const filteredItems: GroceryItem[] = useMemo(() => {
    const foundItems = findItems(initialItems, searchQuery);
    const sortedItems = sortItems(foundItems, sortBy);

    if (viewMode === "Group by Item") {
      return groupItems(sortedItems, sortBy);
    }

    return sortedItems;
  }, [initialItems, searchQuery, sortBy]);

  return (
    <main className="flex justify-center w-full p-[10px]">
      <div className="flex w-full max-w-[1200px] sm:border rounded-xl">
        <div className="hidden sm:block border-r">
          <Sidebar
            sortBy={sortBy}
            viewMode={viewMode}
            onSetSortBy={handleSetSortBy}
            onSetViewMode={handleSetViewMode}
          />
        </div>
        <div className="flex-1 min-w-0  p-[10px]">
          <Header onSetSearchQuery={handleSetSearchQuery} />
          <GroceryList filteredItems={filteredItems} />
        </div>
      </div>
    </main>
  );
}
