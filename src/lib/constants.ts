export const unitConversions = {
  kg: { factor: 10, displayUnit: "g" },
  L: { factor: 10, displayUnit: "mL" },
  g: { factor: 0.01, displayUnit: "g" },
  mL: { factor: 0.01, displayUnit: "mL" },
  units: { factor: 1, displayUnit: "unit" },
  sheets: { factor: 1, displayUnit: "sheet" },
  washloads: { factor: 1, displayUnit: "washload" },
} as const;

export const SORT_OPTIONS = {
  NEWEST: "Recently Added",
  CHEAPEST: "Lowest Price",
} as const;
export const VIEW_OPTIONS = {
  LIST: "List All Items",
  GROUP: "Group Items",
} as const;
export const DEFAULT_SORT = SORT_OPTIONS.NEWEST;
export const DEFAULT_VIEW = VIEW_OPTIONS.LIST;
