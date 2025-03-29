import { Button } from "@/components/ui/button";
import { usePriceChart } from "@/hooks/use-price-chart";
import { formatMonthYear } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DateNavigation() {
  const { timeFrame, dateRange } = usePriceChart();

  const startDate = dateRange.start ? formatMonthYear(dateRange.start) : "";
  const endDate = dateRange.end ? formatMonthYear(dateRange.end) : "";

  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        disabled={timeFrame === "all"}
        // onClick={handlePrevious}
        aria-label="Previous time period"
        className="px-2 h-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium">
        {startDate !== endDate && `${startDate} - `}
        {endDate}
      </span>
      <Button
        variant="ghost"
        size="sm"
        disabled={timeFrame === "all"}
        // disabled={timeFrame === "all" || customTimeOffset >= 0}
        // onClick={handleNext}
        aria-label="Next time period"
        className="px-2 h-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
