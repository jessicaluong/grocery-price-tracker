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
