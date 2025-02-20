import { getGroups, getItems } from "@/data-access/item-repository";
import Main from "@/components/main";
import FilterProvider from "@/contexts/filter-provider";

export default async function Page() {
  // const groups = await getGroups();
  // console.log(groups.slice(0, 10));
  const initialItems = await getItems();
  // console.log(itemWithGroup.slice(0, 3));
  return (
    <FilterProvider initialItems={initialItems}>
      <Main />
    </FilterProvider>
  );
}
