import GroceryItemCard from "./grocery-item-card";
import { ItemWithView, SortParamValues, ViewParamValues } from "@/lib/types";
import GroceryItemDialog from "./grocery-item-dialog";
import { getGroups, getItems } from "@/data-access/item-repository";
import { getFilteredItemsWithView } from "./grocery-list-utils";

type GroceryListProps = {
  viewMode: ViewParamValues;
  sortBy: SortParamValues;
  searchQuery: string;
};

export default async function GroceryList({
  viewMode,
  sortBy,
  searchQuery,
}: GroceryListProps) {
  const initialItems = await getItems();
  const { view, items } = getFilteredItemsWithView(
    initialItems,
    searchQuery,
    sortBy,
    viewMode
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {items.map((item) => {
        const itemWithView = { view, item } as ItemWithView;
        return <GroceryItemCard key={item.id} {...itemWithView} />;
        // return <GroceryItemDialog key={item.id} {...itemWithView} />;
      })}
    </div>
  );
}
