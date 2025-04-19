import { formatDate } from "@/lib/utils";
import { PricePoint } from "@/types/grocery";
import {
  AggregateEntry,
  AggregationResult,
  ChartDataPoint,
  TimeFrame,
} from "@/types/price-chart";

export const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const getWeekKey = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay(); // Get day of week (0 = Sunday)
  d.setDate(d.getDate() - day); // Set to Sunday
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
};

export const getDayKey = (date: Date) => {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};

export function generateMonthlyIntervals(startDate: Date, endDate: Date) {
  const intervals: Date[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let hasJanuary = false;

  start.setDate(1);

  const current = new Date(start);

  while (current <= end) {
    if (current.getMonth() === 0) {
      hasJanuary = true;
    }
    intervals.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }

  return { intervals, hasJanuary };
}

export function generateWeeklyIntervals(startDate: Date, endDate: Date) {
  const intervals: Date[] = [];
  const start = getStartOfWeek(startDate);
  const end = getEndOfWeek(endDate);

  const current = new Date(start);

  while (current <= end) {
    intervals.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }

  return { intervals };
}

export function generateDailyIntervals(date: Date) {
  const intervals: Date[] = [];
  const start = new Date(date);
  const end = new Date(getEndOfMonth(date));

  start.setDate(1);

  const current = new Date(start);

  while (current <= end) {
    intervals.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return { intervals };
}

export function aggregateData(data: PricePoint[], timeFrame: TimeFrame) {
  const aggregatedMap = new Map();

  data.forEach((item) => {
    const date = new Date(formatDate(item.date));
    const price = item.price;

    let key = getMonthKey(date);
    if (timeFrame === "3m") {
      key = getWeekKey(date);
    } else if (timeFrame === "1m") {
      key = getDayKey(date);
    }

    if (!aggregatedMap.has(key)) {
      const newEntry: AggregateEntry = {
        totalPrice: price,
        count: 1,
        totalSalePrice: item.isSale ? price : 0,
        saleCount: item.isSale ? 1 : 0,
        totalRegPrice: !item.isSale ? price : 0,
        regCount: !item.isSale ? 1 : 0,
      };

      if (timeFrame === "3m") {
        newEntry.date = getStartOfWeek(date);
        newEntry.endDate = getEndOfWeek(date);
      } else if (timeFrame === "1m") {
        newEntry.date = new Date(date);
      }

      aggregatedMap.set(key, newEntry);
    } else {
      const group = aggregatedMap.get(key);
      group.totalPrice += price;
      group.count += 1;

      if (item.isSale) {
        group.totalSalePrice += price;
        group.saleCount += 1;
      } else {
        group.totalRegPrice += price;
        group.regCount += 1;
      }
    }
  });

  aggregatedMap.forEach((value, key) => {
    value.avgPrice = value.count > 0 ? value.totalPrice / value.count : 0;
    value.avgSalePrice =
      value.saleCount > 0 ? value.totalSalePrice / value.saleCount : 0;
    value.avgRegPrice =
      value.regCount > 0 ? value.totalRegPrice / value.regCount : 0;

    delete value.totalPrice;
    delete value.totalSalePrice;
    delete value.totalRegPrice;
  });

  return aggregatedMap;
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 is Sunday
  d.setDate(d.getDate() - day); // Go back to Sunday
  return d;
}

export function getEndOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 is Sunday
  d.setDate(d.getDate() + (6 - day)); // Go forward to Saturday
  return d;
}

export function getEndOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0); // Last day of previous month
  return d;
}

export function getQuarterStart(month: number) {
  if (month >= 0 && month <= 2) return 0; // Jan-Mar
  else if (month >= 3 && month <= 5) return 3; // Apr-Jun
  else if (month >= 6 && month <= 8) return 6; // Jul-Sep
  else return 9; // Oct-Dec
}

export function getQuarterEnd(month: number) {
  if (month >= 0 && month <= 2) return 2; // Jan-Mar
  else if (month >= 3 && month <= 5) return 5; // Apr-Jun
  else if (month >= 6 && month <= 8) return 8; // Jul-Sep
  else return 11; // Oct-Dec
}

export function getDateRange(
  minDate: Date,
  maxDate: Date,
  timeFrame: TimeFrame,
  targetDate: Date
) {
  let date = new Date(targetDate);

  // keep date between minDate and maxDate
  if (date > maxDate) {
    date = new Date(maxDate);
  } else if (date < minDate) {
    date = new Date(minDate);
  }

  switch (timeFrame) {
    case "all":
      return { start: minDate, end: maxDate };

    case "y": {
      const year = date.getFullYear();
      const start = new Date(year, 0, 1); // January 1
      const end = new Date(year, 11, 31); // December 31
      return { start, end };
    }

    case "3m": {
      const month = date.getMonth();
      let quarterStartMonth = getQuarterStart(month);
      const year = date.getFullYear();
      const start = new Date(year, quarterStartMonth, 1);
      const end = new Date(year, quarterStartMonth + 3, 0); // Last day of the last month

      return { start, end };
    }

    case "1m": {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = getEndOfMonth(start);
      return { start, end };
    }

    default: // should not reach here
      return { start: minDate, end: maxDate };
  }
}

export function getEquivalentDateForTimeFrame(
  date: Date,
  fromTimeFrame: TimeFrame,
  toTimeFrame: TimeFrame,
  minDate: Date,
  maxDate: Date
) {
  const newDate = new Date(date);

  // Case 1: Moving to "all" time frame - doesn't matter what date we return
  // since the "all" time frame always shows the same range
  if (toTimeFrame === "all") {
    return newDate;
  }

  // Case 2: Moving from "all" time frame - go to latest relevant date
  if (fromTimeFrame === "all") {
    return new Date(maxDate);
  }

  // Case 3: Moving from wider time frame to narrower time frame
  if (
    (fromTimeFrame === "y" && (toTimeFrame === "3m" || toTimeFrame === "1m")) ||
    (fromTimeFrame === "3m" && toTimeFrame === "1m")
  ) {
    const currentDateRange = getDateRange(
      minDate,
      maxDate,
      fromTimeFrame,
      date
    );

    let latestDate = new Date(
      Math.min(maxDate.getTime(), currentDateRange.end.getTime())
    );

    if (fromTimeFrame === "y" && toTimeFrame === "3m") {
      const month = latestDate.getMonth();
      const quarterStartMonth = getQuarterStart(month);
      latestDate.setMonth(quarterStartMonth);
      latestDate.setDate(1);
    }

    if (toTimeFrame === "1m") {
      latestDate.setDate(1);
    }

    return latestDate;
  }

  // Case 4: Moving from narrower timeframe to wider timeframe
  if (
    (fromTimeFrame === "1m" && (toTimeFrame === "3m" || toTimeFrame === "y")) ||
    (fromTimeFrame === "3m" && toTimeFrame === "y")
  ) {
    if (toTimeFrame === "y") {
      newDate.setMonth(0);
      newDate.setDate(1);
    } else if (toTimeFrame === "3m") {
      const month = newDate.getMonth();
      const quarterStartMonth = getQuarterStart(month);
      newDate.setMonth(quarterStartMonth);
      newDate.setDate(1);
    }

    return newDate;
  }

  return newDate;
}

export function getNextDate(date: Date, timeFrame: TimeFrame) {
  const dateFirstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

  switch (timeFrame) {
    case "y":
      dateFirstOfMonth.setFullYear(dateFirstOfMonth.getFullYear() + 1);
      break;
    case "3m":
      dateFirstOfMonth.setMonth(dateFirstOfMonth.getMonth() + 3);
      break;
    case "1m":
      dateFirstOfMonth.setMonth(dateFirstOfMonth.getMonth() + 1);
      break;
  }

  return dateFirstOfMonth;
}

export function getPrevDate(date: Date, timeFrame: TimeFrame) {
  const dateFirstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

  switch (timeFrame) {
    case "y":
      dateFirstOfMonth.setFullYear(dateFirstOfMonth.getFullYear() - 1);
      break;
    case "3m":
      dateFirstOfMonth.setMonth(dateFirstOfMonth.getMonth() - 3);
      break;
    case "1m":
      dateFirstOfMonth.setMonth(dateFirstOfMonth.getMonth() - 1);
      break;
  }

  return dateFirstOfMonth;
}

export function checkCanNavigateNext(
  timeFrame: TimeFrame,
  date: Date,
  maxDate: Date
) {
  switch (timeFrame) {
    case "all":
      return false;
    case "y":
      const curYear = date.getFullYear();
      const maxYear = maxDate.getFullYear();
      return curYear < maxYear;
    case "3m": {
      const nextDate = getNextDate(date, timeFrame);
      const maxMonth = maxDate.getMonth();
      const quarterEnd = getQuarterEnd(maxMonth);
      const quarterEndMonthEnd = getEndOfMonth(
        new Date(maxDate.getFullYear(), quarterEnd, 1)
      );
      return nextDate <= quarterEndMonthEnd;
    }
    case "1m": {
      const nextDate = getNextDate(date, timeFrame);
      const maxDateFirstOfMonth = new Date(
        maxDate.getFullYear(),
        maxDate.getMonth(),
        1
      );
      return nextDate <= maxDateFirstOfMonth;
    }
    default:
      return false;
  }
}

export function checkCanNavigatePrev(
  timeFrame: TimeFrame,
  date: Date,
  minDate: Date
) {
  switch (timeFrame) {
    case "all":
      return false;
    case "y":
      const curYear = date.getFullYear();
      const minYear = minDate.getFullYear();
      return curYear > minYear;
    case "3m": {
      const prevDate = getPrevDate(date, timeFrame);
      const minMonth = minDate.getMonth();
      const quarterStart = getQuarterStart(minMonth);
      const quarterStartMonthStart = new Date(
        minDate.getFullYear(),
        quarterStart,
        1
      );
      return prevDate >= quarterStartMonthStart;
    }
    case "1m": {
      const prevDate = getPrevDate(date, timeFrame);
      const minDateFirstOfMonth = new Date(
        minDate.getFullYear(),
        minDate.getMonth(),
        1
      );
      return prevDate >= minDateFirstOfMonth;
    }
    default:
      return false;
  }
}

export function hasDataInRange(
  data: PricePoint[],
  start: Date,
  end: Date
): boolean {
  if (!data || data.length === 0) return false;

  const startTime = start.getTime();
  const endTime = end.getTime();

  return data.some((item) => {
    const itemDate = new Date(formatDate(item.date)).getTime();
    return itemDate >= startTime && itemDate <= endTime;
  });
}

export function prepareChartData(
  timeFrame: TimeFrame,
  start: Date,
  end: Date,
  data: PricePoint[]
) {
  switch (timeFrame) {
    case "all":
    case "y": {
      const { intervals, hasJanuary } = generateMonthlyIntervals(start, end);
      const aggregateMap = aggregateData(data, "y");

      return intervals.map((interval: Date, index: number) => {
        let xAxisLabel = "";
        if (timeFrame === "all") {
          xAxisLabel = hasJanuary
            ? interval.getMonth() === 0
              ? interval.getFullYear().toString()
              : ""
            : index === 0
            ? interval.getFullYear().toString()
            : "";
        } else if (timeFrame === "y") {
          xAxisLabel = interval
            .toLocaleDateString("en-US", { month: "short" })
            .charAt(0);
        }

        const monthData = aggregateMap.get(getMonthKey(interval));

        return formatChartDataPoint(xAxisLabel, interval, monthData);
      });
    }

    case "3m": {
      const { intervals } = generateWeeklyIntervals(start, end);
      const aggregateMap = aggregateData(data, "3m");

      const monthsInQuarter = new Set<number>();
      const startMonth = start.getMonth();

      for (let i = 0; i < 3; i++) {
        monthsInQuarter.add((startMonth + i) % 12);
      }

      const monthsShown = new Set<number>();

      return intervals.map((interval: Date) => {
        const intervalMonth = interval.getMonth();

        let xAxisLabel = "";
        if (
          monthsInQuarter.has(intervalMonth) &&
          !monthsShown.has(intervalMonth)
        ) {
          xAxisLabel = interval.toLocaleDateString("en-US", {
            month: "short",
          });
          monthsShown.add(intervalMonth);
        }

        const weekData = aggregateMap.get(getWeekKey(interval));

        const dataPoint = formatChartDataPoint(xAxisLabel, interval, weekData);
        if (weekData?.endDate) {
          dataPoint.dateEnd = formatDate(weekData.endDate);
        }

        return dataPoint;
      });
    }

    case "1m": {
      const { intervals } = generateDailyIntervals(start);
      const aggregateMap = aggregateData(data, "1m");

      return intervals.map((interval: Date) => {
        let xAxisLabel = interval.getDate();
        const dayData = aggregateMap.get(getDayKey(interval));
        return formatChartDataPoint(xAxisLabel, interval, dayData);
      });
    }

    default:
      return [];
  }
}

function formatChartDataPoint(
  xAxisLabel: string | number,
  date: Date,
  data: AggregationResult | undefined
): ChartDataPoint {
  return {
    xAxisLabel,
    date: formatDate(date),
    ...(data
      ? {
          price: data.avgPrice,
          saleCount: data.saleCount,
          count: data.count,
          avgSalePrice: data.avgSalePrice,
          avgRegPrice: data.avgRegPrice,
        }
      : {
          price: null,
          saleCount: null,
          count: null,
          avgSalePrice: null,
          avgRegPrice: null,
        }),
  };
}
