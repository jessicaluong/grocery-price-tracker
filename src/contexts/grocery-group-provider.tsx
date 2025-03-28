import { PricePoint } from "@/types/grocery";
import { UseQueryResult } from "@tanstack/react-query";
import { createContext } from "react";

type GroceryGroupContextType = {
  groupId: string;
};

export const GroceryGroupContext =
  createContext<GroceryGroupContextType | null>(null);

type GroceryGroupProviderProps = {
  children: React.ReactNode;
  groupId: string;
};

export default function GroceryGroupProvider({
  children,
  groupId,
}: GroceryGroupProviderProps) {
  return (
    <GroceryGroupContext.Provider value={{ groupId }}>
      {children}
    </GroceryGroupContext.Provider>
  );
}
