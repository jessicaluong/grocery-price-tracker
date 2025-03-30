import { Button } from "@/components/ui/button";
import { usePriceChart } from "@/hooks/use-price-chart";
import { formatMonthYear } from "@/lib/utils";
import { DateRange, TimeFrame } from "@/types/price-chart";
import { ChevronLeft, ChevronRight } from "lucide-react";

type DateNavigationProps = {
  dateRange: DateRange;
};

function getDisplayDateRange(
  timeFrame: TimeFrame,
  start: Date | null,
  end: Date | null
) {
  switch (timeFrame) {
    case "all": {
      const startDate = start ? formatMonthYear(start) : "";
      const endDate = end ? formatMonthYear(end) : "";
      return startDate !== endDate ? `${startDate} - ${endDate}` : endDate;
    }
    case "y": {
      const year = start
        ? start.toLocaleDateString("en-US", {
            year: "numeric",
          })
        : "";
      return year;
    }
    default:
      return "";
  }
}

export default function DateNavigation({ dateRange }: DateNavigationProps) {
  const { timeFrame } = usePriceChart();
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
        {getDisplayDateRange(timeFrame, dateRange.start, dateRange.end)}
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
