"use client";

import { useFilter } from "@/lib/hooks";
import GroceryItemCard from "./grocery-item-card";
import { ItemWithView } from "@/lib/types";

export default function GroceryList() {
  const { filteredItemsWithView } = useFilter();
  const { view, items } = filteredItemsWithView;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {items.map((item) => {
        const itemWithView = { view, item } as ItemWithView;
        return <GroceryItemCard key={item.id} {...itemWithView} />;
      })}
    </div>
  );
}
