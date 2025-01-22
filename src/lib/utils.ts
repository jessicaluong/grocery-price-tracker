import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Unit } from "./types";
import { unitConversions } from "./constants";

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

export function comparePriceFormat(
  count: number,
  price: number,
  amount: number,
  unit: Unit
): string {
  const totalAmount = count * amount;
  const pricePerUnit = price / totalAmount;

  const conversion = unitConversions[unit];
  const convertedPrice = pricePerUnit / conversion.factor;

  return `${currencyFormat(convertedPrice)} / ${
    conversion.factor === 1 ? "" : "100"
  } ${conversion.displayUnit}`;
}

export function matchName(name: string, searchQuery: string) {
  const words = name.toLowerCase().split(/\s+/);
  const searchWords = searchQuery.toLowerCase().split(/\s+/);

  return searchWords.every((searchWord) =>
    words.some((word) => word.startsWith(searchWord))
  );
}
