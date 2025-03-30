import { formatDate, formatMonthYear } from "@/lib/utils";
import { PricePoint } from "@/types/grocery";
import { DateRange, TimeFrame } from "@/types/price-chart";

export const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const getDayKey = (date: Date) => {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};

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

  // All: all months between min month and max month
  // Y: all months between jan of min year and dec of max year
  // 3M: all weeks between week of min week to week of max week ???
  // 1M: days 1-31 starting with day 1 of min month

  return { intervals, hasJanuary };
}

export function generateDailyIntervals(date: Date) {
  const intervals: Date[] = [];
  const start = new Date(date);
  const end = new Date(getEndOfMonth(date));

  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const current = new Date(start);

  while (current <= end) {
    intervals.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return { intervals };
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

export function getMaxOffset(
  minDate: Date,
  maxDate: Date,
  timeFrame: TimeFrame
) {
  switch (timeFrame) {
    case "all":
      return 0;
    case "y":
      return maxDate.getFullYear() - minDate.getFullYear();
    case "3m":
    case "1m":
      return (
        (maxDate.getFullYear() - minDate.getFullYear()) * 12 +
        (maxDate.getMonth() - minDate.getMonth())
      );
    default:
      return 0;
  }
}

export function calculateDateRange(
  minDate: Date,
  maxDate: Date,
  timeFrame: TimeFrame,
  offset: number = 0
) {
  const minYear = minDate.getFullYear();
  const maxYear = maxDate.getFullYear();
  const minMonth = minDate.getMonth();
  const maxMonth = maxDate.getMonth();

  switch (timeFrame) {
    case "all":
      return { start: minDate, end: maxDate };
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
    // const totalMonths = (maxYear - minYear) * 12 + (maxMonth - minMonth) + 1;

    // const targetMonthOffset = Math.min(totalMonths, offset);
    // let targetYear1M = minYear;
    // let targetMonth1M = minMonth;

    // targetMonth1M += targetMonthOffset;
    // while (targetMonth1M >= 12) {
    //   targetYear1M++;
    //   targetMonth1M -= 12;
    //   console.log(`targetMonth1M: ${targetMonth1M}`);
    // }

    // const start1M = new Date(targetYear1M, targetMonth1M, 1);
    // return {
    //   start: start1M,
    //   end: getEndOfMonth(start1M),
    // };

    default:
      return { start: minDate, end: maxDate };
  }

  // offset 0: 2024, 1: 2025
  // use offset, timeFrame, min/max dates to determine which "page" to display

  // get dateRange to generate intervals

  // 3M
  // startMonth
  // endMonth
  // offset 0: Oct-Dec 2024, 1: Jan-Mar 2025

  // 1M
  // month
  // offset 0: Oct 2024, 1: Nov 2024, 2: Dec 2024, 3: Jan 2025, 4: Feb 2025

  // past maxOffset -> disable nav button
  // use offset, timeFrame, min/max dates to determine which "page" to display

  // All: all months between min month and max month
  // Y: all months between jan of min year and dec of max year
  // 3M: all weeks between week of min week to week of max week ???
  // 1M: days 1-31 starting with day 1 of min month
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

  return aggregatedMap;
}

export function aggregateDataByDay(data: PricePoint[]) {
  const aggregatedMap = new Map();

  data.forEach((item) => {
    const date = new Date(formatDate(item.date));
    const key = getDayKey(date);
    const price = item.price;

    if (!aggregatedMap.has(key)) {
      aggregatedMap.set(key, {
        date: new Date(date),
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

  return aggregatedMap;
}
