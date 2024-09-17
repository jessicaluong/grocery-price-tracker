import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Unit } from "./types";

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

  const unitConversions = {
    kg: { factor: 10, displayUnit: "g" },
    L: { factor: 10, displayUnit: "mL" },
    g: { factor: 0.01, displayUnit: "g" },
    mL: { factor: 0.01, displayUnit: "mL" },
    units: { factor: 1, displayUnit: "unit" },
    sheets: { factor: 1, displayUnit: "sheet" },
    washloads: { factor: 1, displayUnit: "washload" },
  };

  const conversion = unitConversions[unit];
  const convertedPrice = pricePerUnit / conversion.factor;

  return `${currencyFormat(convertedPrice)} / ${
    conversion.factor === 1 ? "" : "100"
  } ${conversion.displayUnit}`;
}
