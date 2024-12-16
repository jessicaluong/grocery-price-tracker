import { SORT_OPTIONS, VIEW_OPTIONS, unitConversions } from "./constants";
import { GroceryItem as PrismaGroceryItem } from "@prisma/client";

export type Unit = keyof typeof unitConversions;

export type GroceryItem = Omit<PrismaGroceryItem, "unit"> & {
  unit: Unit;
};

export type SortOptions = (typeof SORT_OPTIONS)[number];
export type ViewOptions = (typeof VIEW_OPTIONS)[number];
