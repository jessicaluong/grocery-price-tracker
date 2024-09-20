import { FilterContext } from "@/contexts/filter-provider";
import { useContext } from "react";

export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
}
