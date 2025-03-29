import { formatDate } from "@/lib/utils";
import { PricePoint } from "@/types/grocery";

export const getKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export function generateIntervals(startDate: Date, endDate: Date) {
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

export function aggregateDataByMonth(data: PricePoint[]) {
  const aggregatedMap = new Map();

  data.forEach((item) => {
    const date = new Date(formatDate(item.date));
    const key = getKey(date);
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
