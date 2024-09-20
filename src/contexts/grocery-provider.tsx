"use client";

import { GroceryItem } from "@/lib/types";
import { createContext, useState } from "react";

type GroceryContextType = { groceryItems: GroceryItem[] };

export const GroceryContext = createContext<GroceryContextType | null>(null);

type GroceryProviderProps = {
  children: React.ReactNode;
};

export default function GroceryProvider({ children }: GroceryProviderProps) {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([
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
      name: "lemon juice",
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
  ]);

  return (
    <GroceryContext.Provider value={{ groceryItems }}>
      {children}
    </GroceryContext.Provider>
  );
}
