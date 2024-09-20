"use client";

import { useFilter } from "@/lib/hooks";
import GroceryItemCard from "./grocery-item-card";

export default function GroceryList() {
  const { filteredItems } = useFilter();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {filteredItems.map((item) => (
        <GroceryItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
