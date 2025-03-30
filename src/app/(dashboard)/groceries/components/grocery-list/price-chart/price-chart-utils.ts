import { formatDate, formatMonthYear } from "@/lib/utils";
import { PricePoint } from "@/types/grocery";
import { DateRange, TimeFrame } from "@/types/price-chart";

export const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export function generateMonthlyIntervals(startDate: Date, endDate: Date) {
  const intervals: Date[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  // const end = new Date(Date.now());
  let hasJanuary = false;

  start.setDate(1);
  start.setHours(0, 0, 0, 0);

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

export function getEndOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0); // Last day of previous month
  return d;
}

export function getSunday(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function calculateDateRange(
  minDate: Date,
  maxDate: Date,
  timeFrame: TimeFrame,
  offset: number = 0
) {
  const minYear = minDate.getFullYear();
  const maxYear = maxDate.getFullYear();

  switch (timeFrame) {
    case "y": {
      const targetYear = Math.min(maxYear, minYear + offset);

      const start = new Date(targetYear, 0, 1); // January 1
      const end = new Date(targetYear, 11, 31); // December 31

      return { start, end };
    }
    case "3m":
      // get sunday for that date
      // add 7 to that date until offset
      const minSunday = getSunday(minDate);

    case "1m": {
      const start = new Date(minDate);
      const end = new Date(maxDate);

      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      const targetMonth = new Date(start);

      for (let i = 0; targetMonth <= end && i < offset; i++) {
        targetMonth.setMonth(targetMonth.getMonth() + 1);
      }

      return {
        start: targetMonth,
        end: getEndOfMonth(targetMonth),
      };
    }
    default:
      return { start: minDate, end: maxDate };
  }
}

export function aggregateDataByMonth(data: PricePoint[]) {
  const aggregatedMap = new Map();

  data.forEach((item) => {
    const date = new Date(formatDate(item.date));
    const key = getMonthKey(date);
    const price = item.price;

    if (!aggregatedMap.has(key)) {
      aggregatedMap.set(key, {
        totalPrice: price,
        count: 1,
        totalSalePrice: item.isSale ? price : 0,
        saleCount: item.isSale ? 1 : 0,
        totalRegPrice: !item.isSale ? price : 0,
        regCount: !item.isSale ? 1 : 0,
      });
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

  console.log(aggregatedMap);
  return aggregatedMap;
}
