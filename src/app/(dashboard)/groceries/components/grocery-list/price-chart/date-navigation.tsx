import { Button } from "@/components/ui/button";
import { formatMonthYear } from "@/lib/utils";
import { DateRange, TimeFrame } from "@/types/price-chart";
import { ChevronLeft, ChevronRight } from "lucide-react";

type DateNavigationProps = {
  timeFrame: TimeFrame;
  dateRange: DateRange;
  canNavigateNext: boolean;
  canNavigatePrev: boolean;
  navigateNext: () => void;
  navigatePrev: () => void;
};

function getDisplayDateRange(timeFrame: TimeFrame, start: Date, end: Date) {
  switch (timeFrame) {
    case "all": {
      const startMonthYear = formatMonthYear(start);
      const endMonthYear = formatMonthYear(end);
      return startMonthYear !== endMonthYear
        ? `${startMonthYear} - ${endMonthYear}`
        : endMonthYear;
    }
    case "y": {
      const year = start.toLocaleDateString("en-US", {
        year: "numeric",
      });
      return year;
    }
    case "3m": {
      const startMonth = start.toLocaleDateString("en-US", {
        month: "short",
      });
      const endMonthYear = formatMonthYear(
        new Date(start.getFullYear(), start.getMonth() + 2, 1)
      );
      return `${startMonth} - ${endMonthYear}`;
    }
    case "1m": {
      const month = formatMonthYear(start);
      return month;
    }
    default:
      return "";
  }
}

export default function DateNavigation({
  dateRange,
  timeFrame,
  canNavigateNext,
  canNavigatePrev,
  navigateNext,
  navigatePrev,
}: DateNavigationProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        disabled={!canNavigatePrev}
        onClick={navigatePrev}
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
        disabled={!canNavigateNext}
        onClick={navigateNext}
        aria-label="Next time period"
        className="px-2 h-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
