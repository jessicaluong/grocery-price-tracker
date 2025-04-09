import { Unit } from "./grocery";

export type ReceiptItem = {
  name: string;
  price: number;
  amount: number;
  unit: Unit;
  isSale: boolean;
  brand: string | null; // not extracted from receipt
  count: number; // not extracted from receipt
};

export type ReceiptData = {
  store: string;
  date: Date;
  items: ReceiptItem[];
};
