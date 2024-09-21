import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import GroceryList from "@/components/grocery-list/grocery-list";

export default function Home() {
  return (
    <main className="flex justify-center w-full p-[10px]">
      <div className="flex w-full max-w-[1200px] sm:border rounded-xl">
        <div className="hidden sm:block border-r">
          <Sidebar />
        </div>
        <div className="flex-1 min-w-0  p-[10px]">
          <Header />
          <GroceryList />
        </div>
      </div>
    </main>
  );
}
