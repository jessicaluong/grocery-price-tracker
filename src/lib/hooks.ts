import { SearchContext } from "@/contexts/search-provider";
import { useContext } from "react";

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
