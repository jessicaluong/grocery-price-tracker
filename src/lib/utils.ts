import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Unit } from "../types/grocery";
import {
  DEFAULT_SORT,
  DEFAULT_VIEW,
  SORT_OPTIONS,
  unitConversions,
  VIEW_OPTIONS,
} from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function currencyFormat(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDate(
  dateValue: string | Date,
  monthFmt: "numeric" | "2-digit" | "long" | "short" | "narrow" = "short",
  dayFmt: "numeric" | "2-digit" = "numeric",
  yearFmt: "numeric" | "2-digit" = "numeric"
): string {
  const date = new Date(dateValue as string | number | Date);

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: monthFmt,
    day: dayFmt,
    year: yearFmt,
    timeZone: "UTC",
  });

  const utcDate = new Date(Date.UTC(year, month, day));

  return formatter.format(utcDate);
}

export function formatMonthYear(
  dateValue: string | Date,
  monthFmt: "numeric" | "2-digit" | "long" | "short" | "narrow" = "short",
  yearFmt: "numeric" | "2-digit" = "numeric"
): string {
  const date = new Date(dateValue as string | number | Date);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();

  const options: Intl.DateTimeFormatOptions = {
    month: monthFmt,
    year: yearFmt,
    timeZone: "UTC",
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);
  const utcDate = new Date(Date.UTC(year, month, 1)); // Always use the 1st of the month
  return formatter.format(utcDate);
}

export function getConvertedPrice(
  count: number,
  price: number,
  amount: number,
  unit: Unit
) {
  const totalAmount = count * amount;
  const pricePerUnit = price / totalAmount;

  const conversion = unitConversions[unit];
  const convertedPrice = pricePerUnit / conversion.factor;

  return convertedPrice;
}

export function comparePriceFormat(
  count: number,
  price: number,
  amount: number,
  unit: Unit
): string {
  const conversion = unitConversions[unit];
  const convertedPrice = getConvertedPrice(count, price, amount, unit);

  if (count === 0 || amount === 0) {
    return "N/A";
  }

  return `${currencyFormat(convertedPrice)} /${
    conversion.factor === 1 ? "" : " 100"
  } ${conversion.displayUnit}`;
}

export function matchName(name: string, searchQuery: string) {
  const words = name.toLowerCase().split(/\s+/);
  const searchWords = searchQuery.toLowerCase().split(/\s+/);

  return searchWords.every((searchWord) =>
    words.some((word) => word.startsWith(searchWord))
  );
}

export const formatString = (str: string | null): string => {
  if (!str) return "";
  return str.replace(/\s/g, "").trim().toLowerCase();
};

export function getDisplayFromParam(type: "sort" | "view", param: string) {
  const options = type === "sort" ? SORT_OPTIONS : VIEW_OPTIONS;
  const entry = Object.values(options).find(
    (option) => option.param.toLowerCase() === param.toLowerCase()
  );
  return (
    entry?.display ||
    (type === "sort" ? DEFAULT_SORT.display : DEFAULT_VIEW.display)
  );
}

export function getParamFromDisplay(type: "sort" | "view", display: string) {
  const options = type === "sort" ? SORT_OPTIONS : VIEW_OPTIONS;
  const entry = Object.values(options).find(
    (option) => option.display.toLowerCase() === display.toLowerCase()
  );
  return (
    entry?.param || (type === "sort" ? DEFAULT_SORT.param : DEFAULT_VIEW.param)
  );
}
