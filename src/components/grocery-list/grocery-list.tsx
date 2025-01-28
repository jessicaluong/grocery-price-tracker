import GroceryItemCard from "./grocery-item-card";
import { ItemsWithViewMode, ItemWithView } from "@/lib/types";

type GroceryListProps = {
  filteredItemsWithView: ItemsWithViewMode;
};

export default function GroceryList({
  filteredItemsWithView,
}: GroceryListProps) {
  const { view, items } = filteredItemsWithView;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {items.map((item) => {
        const cardProps = { view, item } as ItemWithView;
        return <GroceryItemCard key={item.id} {...cardProps} />;
      })}
    </div>
  );
}
