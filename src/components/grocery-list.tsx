"use client";

import { useFilter } from "@/lib/hooks";
import GroceryItemCard from "./grocery-item-card";
import { GroceryItem } from "@/lib/types";

type GroceryListProps = {
  groceryItems: GroceryItem[];
};

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

export default function GroceryList({ groceryItems }: GroceryListProps) {
  const { searchQuery } = useFilter();

  const filteredItems = groceryItems.filter((item) => {
    const itemNameMatch = matchItemName(item.name, searchQuery);
    const brandNameMatch =
      item.brand && matchBrandName(item.brand, searchQuery);

    return itemNameMatch || brandNameMatch;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {filteredItems.map((item) => (
        <GroceryItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
