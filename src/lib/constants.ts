export const unitConversions = {
  kg: { factor: 10, displayUnit: "g" },
  L: { factor: 10, displayUnit: "mL" },
  g: { factor: 0.01, displayUnit: "g" },
  mL: { factor: 0.01, displayUnit: "mL" },
  units: { factor: 1, displayUnit: "unit" },
  sheets: { factor: 1, displayUnit: "sheet" },
  washloads: { factor: 1, displayUnit: "washload" },
} as const;

export const SORT_OPTIONS = ["Lowest Price", "Recently Added"] as const;
export const VIEW_OPTIONS = ["List All Dates", "Group by Item"] as const;
export const DEFAULT_SORT = SORT_OPTIONS[0];
export const DEFAULT_VIEW = VIEW_OPTIONS[0];
