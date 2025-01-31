import { getGroceryItems } from "@/data-access/grocery-item";
import Main from "@/components/main";
import FilterProvider from "@/contexts/filter-provider";

export default async function Page() {
  const groceryItems = await getGroceryItems();
  return (
    <FilterProvider initialItems={groceryItems}>
      <Main />
    </FilterProvider>
  );
}
