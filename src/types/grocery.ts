import { z } from "zod";
import { SORT_OPTIONS, VIEW_OPTIONS } from "../lib/constants";
import { Group as PrismaGroup, Unit as PrismaUnit } from "@prisma/client";

export type Unit = PrismaUnit;
export const UnitEnum = PrismaUnit;
export const UnitSchema = z.enum(Object.values(UnitEnum) as [Unit, ...Unit[]]);

export type DbGroup = Omit<PrismaGroup, "createdAt" | "updatedAt" | "userId">;

export type GroceryItem = {
  id: string;
  name: string;
  brand: string | null;
  store: string;
  count: number; // TODO: rename to bulkCount
  amount: number;
  unit: Unit;
  date: Date;
  price: number;
  isSale: boolean;
  groupId: string;
};

export type PricePoint = {
  id: string;
  date: Date;
  price: number;
  isSale: boolean;
};

export type GroceryGroup = {
  id: string;
  name: string;
  brand: string | null;
  store: string;
  count: number; // TODO: rename to bulkCount
  amount: number;
  unit: Unit;
  itemCount: bigint | null;
  maxPrice: number | null;
  minPrice: number | null;
  newestDate: Date | null;
};

export type GroupMap = Map<
  string,
  {
    name: string;
    brand: string | null;
    store: string;
    count: number;
    amount: number;
    unit: Unit;
    maxPrice: number | null;
    minPrice: number | null;
    newestDate: Date | null;
    itemCount: number;
  }
>;

export type SortDisplayValues =
  (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS]["display"];
export type ViewDisplayValues =
  (typeof VIEW_OPTIONS)[keyof typeof VIEW_OPTIONS]["display"];

export type SortParamValues =
  (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS]["param"];
export type ViewParamValues =
  (typeof VIEW_OPTIONS)[keyof typeof VIEW_OPTIONS]["param"];

export type ItemWithView =
  | { view: "LIST"; item: GroceryItem; groupMap: GroupMap }
  | { view: "GROUP"; item: GroceryGroup; groupMap: GroupMap };

export type ItemsWithViewMode =
  | { view: "LIST"; items: GroceryItem[]; groupMap: GroupMap }
  | { view: "GROUP"; items: GroceryGroup[]; groupMap: GroupMap };

export type ServerErrors = Record<string, string | string[]> | null;
