import { SORT_OPTIONS, VIEW_OPTIONS } from "./constants";
import {
  Item as PrismaItem,
  Group as PrismaGroup,
  Unit as PrismaUnit,
} from "@prisma/client";

export type Unit = PrismaUnit;
export { PrismaUnit as UnitEnum };

type DbItem = Omit<PrismaItem, "createdAt" | "updatedAt">;
type DbGroup = Omit<PrismaGroup, "createdAt" | "updatedAt">;

/**
 * Core Item type
 * Properties:
 * - id: string
 * - name: string
 * - brand: string | null
 * - store: string
 * - count: number
 * - amount: number
 * - unit: Unit
 * - date: Date
 * - price: number
 * - isSale: boolean
 * - groupId: string
 */
export type GroceryItem = DbItem & Omit<DbGroup, "id">;

/**
 * Price point for historical price tracking
 * Properties:
 * - id: string
 * - date: Date
 * - price: number
 * - isSale: boolean
 */
export type PricePoint = Pick<DbItem, "id" | "date" | "price" | "isSale">;

/**
 * Core Group type
 * Properties:
 * - id: string
 * - name: string
 * - brand: string | null
 * - store: string
 * - count: number
 * - amount: number
 * - unit: Unit
 * - maxPrice: number
 * - minPrice: number
 * - priceHistory: PricePoint[]
 */
export type GroceryGroup = DbGroup & {
  minPrice: number;
  maxPrice: number;
  priceHistory: PricePoint[];
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
    minPrice: number;
    maxPrice: number;
    pricePoints: PricePoint[];
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
