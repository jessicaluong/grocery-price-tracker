import { GroceryGroupContext } from "@/contexts/grocery-group-provider";
import { useContext } from "react";

export function useGroceryGroupContext() {
  const context = useContext(GroceryGroupContext);
  if (!context) {
    throw new Error(
      "useGroceryGroupContext must be used within a GroceryGroupProvider"
    );
  }
  return context;
}
