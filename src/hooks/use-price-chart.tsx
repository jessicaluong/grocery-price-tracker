import { PriceChartContext } from "@/contexts/price-chart-provider";
import { useContext } from "react";

export function usePriceChart() {
  const context = useContext(PriceChartContext);
  if (!context) {
    throw new Error(
      "usePriceChartContext must be used within a GroceryGroupProvider"
    );
  }
  return context;
}
