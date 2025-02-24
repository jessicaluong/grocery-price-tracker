import { SORT_OPTIONS, VIEW_OPTIONS } from "./constants";
import {
  Item as PrismaItem,
  Group as PrismaGroup,
  Unit as PrismaUnit,
} from "@prisma/client";

export type Unit = PrismaUnit;

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
 * - date: Date
 * - price: number
 * - isSale: boolean
 */
export type PricePoint = Pick<DbItem, "date" | "price" | "isSale">;

/**
 * Core Group type
 * Properties:
 * - id: string
 * - name: string
 * - brand: string | null
 * - store: string
 * - count: number
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

export type PriceHistoryPoint = {
  id: string;
  date: string;
  price: number;
  isSale: boolean;
};

export type PriceHistoryData = {
  priceHistory: PriceHistoryPoint[];
  minPrice: number;
  maxPrice: number;
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

export type SortOptions = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];

export type ViewOptions = (typeof VIEW_OPTIONS)[keyof typeof VIEW_OPTIONS];

export type ItemWithView =
  | { view: "LIST"; item: GroceryItem }
  | { view: "GROUP"; item: GroceryGroup };

export type ItemsWithViewMode =
  | { view: "LIST"; items: GroceryItem[] }
  | { view: "GROUP"; items: GroceryGroup[] };
