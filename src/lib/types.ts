import { SORT_OPTIONS, VIEW_OPTIONS, unitConversions } from "./constants";
import { GroceryItem as PrismaGroceryItem } from "@prisma/client";

export type Unit = keyof typeof unitConversions;

export type GroceryItem = PrismaGroceryItem;

export type PricePoint = {
  date: Date;
  price: number;
  isSale: boolean;
};

export type GroceryGroup = {
  id: string;
  name: string;
  brand: string | null;
  store: string;
  count: number;
  amount: number;
  unit: Unit;
  numberOfItems: number;
  priceRange: {
    min: number;
    max: number;
  };
  priceHistory: PricePoint[];
};

export type SortOptions = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];

export type ViewOptions = (typeof VIEW_OPTIONS)[keyof typeof VIEW_OPTIONS];

export type ItemWithView =
  | { view: "LIST"; item: GroceryItem }
  | { view: "GROUP"; item: GroceryGroup };

export type ItemsWithViewMode =
  | { view: "LIST"; items: GroceryItem[] }
  | { view: "GROUP"; items: GroceryGroup[] };
