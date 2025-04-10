import { capitalizeWords } from "./utils";

export function processSaleItemName(name: string | null) {
  if (!name) {
    return { normalizedName: null, isSale: false };
  }

  const salePattern = /(\(sale\)|\[sale\]|\bsale\b)/i;
  const saleMatch = name.match(salePattern);

  if (saleMatch) {
    let cleanedName = name.replace(saleMatch[0], "").trim();
    cleanedName = cleanedName.replace(/\s+/g, " ").trim();
    return {
      normalizedName: capitalizeWords(cleanedName),
      isSale: true,
    };
  } else {
    return {
      normalizedName: capitalizeWords(name),
      isSale: false,
    };
  }
}
