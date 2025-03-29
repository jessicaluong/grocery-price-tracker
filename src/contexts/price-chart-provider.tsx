import { DateRange, TimeFrame } from "@/types/price-chart";
import React from "react";
import { createContext } from "react";

type PriceChartContextType = {
  timeFrame: TimeFrame;
  handleSetTimeFrame: (timeFrame: TimeFrame) => void;
  dateRange: DateRange;
  handleSetDateRange: (dateRange: DateRange) => void;
};

export const PriceChartContext = createContext<PriceChartContextType | null>(
  null
);

type PriceChartProviderProps = {
  children: React.ReactNode;
};

export default function PriceChartProvider({
  children,
}: PriceChartProviderProps) {
  const [timeFrame, setTimeFrame] = React.useState<TimeFrame>("all");
  const [dateRange, setDateRange] = React.useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });

  const handleSetTimeFrame = (timeFrame: TimeFrame) => {
    setTimeFrame(timeFrame);
  };

  const handleSetDateRange = (dateRange: DateRange) => {
    setDateRange(dateRange);
  };

  return (
    <PriceChartContext.Provider
      value={{
        timeFrame,
        handleSetTimeFrame,
        dateRange,
        handleSetDateRange,
      }}
    >
      {children}
    </PriceChartContext.Provider>
  );
}
