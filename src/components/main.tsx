"use client";

import Header from "@/components/header/header";
import GroceryList from "@/components/grocery-list/grocery-list";

export default function Main() {
  return (
    <main className="flex justify-center w-full p-[10px]">
      <div className="flex w-full max-w-[1200px] sm:border rounded-xl">
        <div className="flex-1 min-w-0  p-[10px]">
          <Header />
          <GroceryList />
        </div>
      </div>
    </main>
  );
}
