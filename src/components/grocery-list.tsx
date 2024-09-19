"use client";

import { useSearch } from "@/lib/hooks";
import GroceryItemCard from "./grocery-item-card";
import { GroceryItem } from "@/lib/types";

type GroceryListProps = {
  groceryItems: GroceryItem[];
};
export default function GroceryList({ groceryItems }: GroceryListProps) {
  const { searchQuery } = useSearch();

  const filteredItems = groceryItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {filteredItems.map((item) => (
        <GroceryItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
