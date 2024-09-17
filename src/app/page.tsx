import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import GroceryList from "../components/grocery-list";
import { GroceryItem } from "@/lib/types";

const groceryItems: GroceryItem[] = [
  {
    id: "1",
    name: "oats",
    brand: "Quaker",
    store: "Superstore",
    count: 1,
    amount: 1,
    unit: "kg",
    price: 4.27,
    date: "2024-09-12",
    isSale: true,
  },
  {
    id: "2",
    name: "orange juice",
    brand: "Tropicana",
    store: "Walmart",
    count: 1,
    amount: 100,
    unit: "mL",
    price: 4,
    date: "2024-09-12",
    isSale: true,
  },
  {
    id: "3",
    name: "organic oats",
    brand: "Quaker",
    store: "T&T",
    count: 1,
    amount: 1,
    unit: "kg",
    price: 25.1,
    date: "2024-09-12",
    isSale: false,
  },
  {
    id: "4",
    name: "milk",
    brand: "Natrel",
    store: "Costco",
    count: 1,
    amount: 3.5,
    unit: "L",
    price: 6.99,
    date: "2024-09-12",
    isSale: false,
  },
  {
    id: "5",
    name: "oats",
    brand: "Quaker",
    store: "Superstore",
    count: 1,
    amount: 1.5,
    unit: "kg",
    price: 12.99,
    date: "2024-09-12",
    isSale: true,
  },
  {
    id: "6",
    name: "orange juice",
    brand: "simply orange",
    store: "Superstore",
    count: 1,
    amount: 1,
    unit: "L",
    price: 5.99,
    date: "2024-09-12",
    isSale: false,
  },
  {
    id: "7",
    name: "orange juice",
    brand: "simply orange",
    store: "Superstore",
    count: 1,
    amount: 250,
    unit: "mL",
    price: 2.5,
    date: "2024-09-12",
    isSale: false,
  },
  {
    id: "8",
    name: "toothbrushes",
    brand: "Oral-B",
    store: "Costco",
    count: 1,
    amount: 8,
    unit: "units",
    price: 12.99,
    date: "2024-09-12",
    isSale: true,
  },
  {
    id: "9",
    name: "paper towel",
    brand: "Bounty",
    store: "Costco",
    count: 12,
    amount: 86,
    unit: "sheets",
    price: 22.49,
    date: "2024-09-12",
    isSale: true,
  },
  {
    id: "10",
    name: "vitamin D3",
    brand: "Webbers",
    store: "Costco",
    count: 1,
    amount: 300,
    unit: "units",
    price: 22.49,
    date: "2024-09-12",
    isSale: false,
  },
  {
    id: "11",
    name: "laundry detergent",
    brand: "Tide",
    store: "Costco",
    count: 1,
    amount: 89,
    unit: "washloads",
    price: 22.49,
    date: "2024-09-12",
    isSale: false,
  },
  {
    id: "12",
    name: "toothpaste",
    brand: "Crest",
    store: "Costco",
    count: 5,
    amount: 135,
    unit: "mL",
    price: 14.49,
    date: "2024-09-12",
    isSale: true,
  },
  {
    id: "13",
    name: "bok choy",
    store: "PriceSmart",
    count: 1,
    amount: 1.5,
    unit: "kg",
    price: 5,
    date: "2024-09-13",
    isSale: true,
  },
];

export default function Home() {
  return (
    <main className="flex justify-center w-full p-[10px]">
      <div className="flex w-full max-w-[1200px] sm:border rounded-xl">
        <div className="hidden sm:block border-r">
          <Sidebar />
        </div>
        <div className="flex-1 min-w-0  p-[10px]">
          <Header />
          <GroceryList groceryItems={groceryItems} />
        </div>
      </div>
    </main>
  );
}
