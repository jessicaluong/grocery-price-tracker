import GroceryItemCard from "./grocery-item-card";
import { GroceryItem } from "@/lib/types";

type GroceryListProps = {
  groceryItems: GroceryItem[];
};
export default function GroceryList({ groceryItems }: GroceryListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {groceryItems.map((item) => (
        <GroceryItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
