import GroceryItemCard from "./grocery-item-card";
import { ItemWithView, SortParamValues, ViewParamValues } from "@/lib/types";
import { getItems } from "@/data-access/item-repository";
import { getFilteredItemsWithView } from "./grocery-list-utils";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

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
  const session = await getServerSession(authOptions);
  if (!session || !session?.user?.id) {
    redirect("/login");
  }

  const initialItems = await getItems(session.user.id);
  const { view, items, groupMap } = getFilteredItemsWithView(
    initialItems,
    searchQuery,
    sortBy,
    viewMode
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {items.map((item) => {
        const itemWithView = { view, item, groupMap } as ItemWithView;
        return <GroceryItemCard key={item.id} {...itemWithView} />;
      })}
    </div>
  );
}
