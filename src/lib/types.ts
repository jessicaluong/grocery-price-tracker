import { SORT_OPTIONS, VIEW_OPTIONS } from "./constants";

export type Unit = "kg" | "g" | "mL" | "L" | "units" | "sheets" | "washloads";

export type GroceryItem = {
  id: string;
  name: string;
  brand?: string;
  store: string;
  count: number;
  amount: number;
  unit: Unit;
  price: number;
  date: string;
  isSale: boolean;
};

export type SortOptions = (typeof SORT_OPTIONS)[number];
export type ViewOptions = (typeof VIEW_OPTIONS)[number];
