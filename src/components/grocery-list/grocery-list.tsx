import GroceryItemCard from "./grocery-item-card";
import { GroceryItem } from "@/lib/types";

type GroceryListProps = {
  filteredItems: GroceryItem[];
};

export default function GroceryList({ filteredItems }: GroceryListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {filteredItems.map((item) => (
        <GroceryItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
