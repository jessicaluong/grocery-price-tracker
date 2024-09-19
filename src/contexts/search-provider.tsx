"use client";

import { createContext, useState } from "react";

type SearchContextType = {
  searchQuery: string;
  handleSetSearchQuery: (query: string) => void;
};

export const SearchContext = createContext<SearchContextType | null>(null);

type SearchProviderProps = {
  children: React.ReactNode;
};

export default function SearchProvider({ children }: SearchProviderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSetSearchQuery = (query: string) => {
    setSearchQuery(query);
    // console.log(searchQuery);

    // escape should remove query
  };

  return (
    <SearchContext.Provider value={{ searchQuery, handleSetSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
}
