import { getGroceryItems } from "@/data-access/grocery-item";
import Main from "@/components/main";

export default async function Home() {
  const groceryItems = await getGroceryItems();
  return <Main initialItems={groceryItems} />;
}
