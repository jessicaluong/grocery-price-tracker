import GroceryItemCard from "./grocery-item-card";
import { ItemWithView, SortParamValues, ViewParamValues } from "@/lib/types";
import { getItems } from "@/data-access/item-repository";
import { getFilteredItemsWithView } from "./grocery-list-utils";
import { ShoppingCart } from "lucide-react";
import AddItemDialog from "../item-dialogs/add-item/add-item-dialog";
import { verifySession } from "@/lib/auth";

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
  const session = await verifySession();
  if (!session) return null;

  const initialItems = await getItems();
  const { view, items, groupMap } = getFilteredItemsWithView(
    initialItems,
    searchQuery,
    sortBy,
    viewMode
  );

  // Empty grocery list
  if (initialItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">
          Your grocery list is empty
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Start tracking grocery prices by adding your first item.
        </p>
        <AddItemDialog />
      </div>
    );
  }

  // No search results
  if (items.length === 0 && searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <h3 className="text-xl font-semibold mb-2">No results found</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          We couldn't find any items matching "
          <span className="font-medium">{searchQuery}</span>". Try using
          different keywords or check your spelling.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {items.map((item) => {
        const itemWithView = { view, item, groupMap } as ItemWithView;
        return <GroceryItemCard key={item.id} {...itemWithView} />;
      })}
    </div>
  );
}
