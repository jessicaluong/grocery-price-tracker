import { FilterContext } from "@/contexts/filter-provider";
import { GroceryContext } from "@/contexts/grocery-provider";
import { useContext } from "react";

export function useGrocery() {
  const context = useContext(GroceryContext);
  if (!context) {
    throw new Error("useGrocery must be used within a GroceryProvider");
  }
  return context;
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
}
